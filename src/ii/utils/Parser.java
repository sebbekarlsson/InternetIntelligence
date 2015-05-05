package ii.utils;

import ii.main.Main;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Arrays;

import org.apache.commons.io.FilenameUtils;
import org.jsoup.Connection;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

public class Parser {


	public static final String[] extensions = new String[]{
		"css",
		"js",
		"xml",
		"txt",
		"json",
		"jpg",
		"JPG",
		"JPEG",
		"PNG",
		"png",
		"gif",
		"mp4",
		"mp3",
		"wav",
		"mov",
		"flv",
		"webm",
		"avi",
		"mpeg4",
		"mpeg",
		"wmv",
		"java",
		"jar",
		"db",
		"sql",
		"zip",
		"rar",
		"7zip",
		"bmp",
		"jpeg",
		"xlsx",
		"xls",
		"doc",
		"pages",
		"yaml",
		"py",
		"sh",
		"vbs",
		"bat",
		"exe",
		"dmg",
		"app",
		"apk",
		"ini",
		"conf",
		"config",
		"ico",
		"svg",
		"pdf"
	};


	public static void parse(final String url){
		
		//System.out.println("PARSING: "+url);
		
		new Thread(new Runnable(){
			@Override
			public void run(){
				try {
					Thread.sleep(60);
				} catch (InterruptedException e1) {
					e1.printStackTrace();
				}
				Document doc = null;
				Connection con = Jsoup.connect(url)
						.userAgent("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/535.21 (KHTML, like Gecko) Chrome/19.0.1042.0 Safari/535.21")
						.timeout(30000);



				try {
					if(con.execute().statusCode() != 200){
						System.err.println("Could not reach "+url);
						return;
					}
					doc = con.get();
				} catch (IOException e) {
					return;
				}
				
				Elements elements = doc.select("a[href], img[src], link[href], script[src]");
				for (Element element : elements) {
					String link = element.attr("abs:href");
					if(link.isEmpty() || link.equals("") || link.equals(" ")){
						link = element.attr("abs:src");
					}
					
					if(!(link.startsWith("http") || !link.startsWith("https"))){
						link = "http://"+DomainUtils.getDomainName(url)+link;
					}else if(link.startsWith("//")){
						link = "http:"+link;
					}

					String extension = FilenameUtils.getExtension(FilenameUtils.getName(link));
					if(link.equals("")){
						return;
					}
					if(Arrays.asList(extensions).contains(extension)){
						
						Dumpster.DOWNLOADS.add(link);
					}else{
						final String safeurl = link.replaceAll("'", "");
						if(!Main.sqlite.urlExists(safeurl)){
							Main.URLS.add(link);
							//System.out.println("GOTO " + link);
						}
					}
				}
				// Parsed ;)
				//Main.sqlite.query("INSERT INTO History (url) VALUES ('" + safeurl +"');");

			}
		}).start();
	}



	


	
}

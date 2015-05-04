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


	public static String[] extensions = new String[]{
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


	public static void parse(String url){
		System.out.println("PARSING: "+url);
		new Thread(new Runnable(){
			@Override
			public void run(){
				try {
					Thread.sleep(60);
				} catch (InterruptedException e1) {
					// TODO Auto-generated catch block
					e1.printStackTrace();
				}
				Document doc = null;
				Connection con = Jsoup.connect(url)
						//.userAgent("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/535.21 (KHTML, like Gecko) Chrome/19.0.1042.0 Safari/535.21")
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
				

				
				Elements elements = doc.select("[href], [src]");
				for (Element element : elements) {
					String link = element.attr("abs:href");
					if(link.isEmpty() || link.equals("") || link.equals(" ")){
						link = element.attr("abs:src");
					}

					if(!(link.startsWith("http") || link.startsWith("https"))){
						link = "http://www."+DomainUtils.getDomainName(url)+link;
					}

					String extension = FilenameUtils.getExtension(FilenameUtils.getName(link));
					if(link.equals("")){
						return;
					}
					if(Arrays.asList(extensions).contains(extension)){
						Dumpster.DOWNLOADS.add(link);
					}else{
						Main.URLS.add(link);
					}

				}
				
				/*Elements paragraph_elements = doc.select("p");
				for(Element element : paragraph_elements){
				String text = element.text().replaceAll("['|(|)|{|}|´|\"]", "").toLowerCase();
				String[] words = text.split(" ");
				
				for(int i = 0; i < words.length; i++){
					String word = words[i];
					String word_type = "word";
					String prev_word = words[Math.max(i-1, 0)];
					String next_word = words[Math.min(words.length-1, i+1)];

					if(
							next_word.equals("is") ||
							next_word.equals("are") ||
							next_word.equals("will") ||
							next_word.equals("can") ||
							prev_word.equals("the")
					){
						word_type = "object";
					}
					else if(prev_word.equals("is")){
						word_type = "describing";
						
					}
					
					
					
	
					
					Main.sqlite.query("REPLACE INTO words (wordName, wordType) VALUES('"+word+"', '"+word_type+"')");
				}
				
				Main.sqlite.query("REPLACE INTO paragraphs (paragraphText) VALUES('"+text+"')");
			}

				Main.URLS.remove(url);
				Main.VISITED_URLS.add(url);*/

			}
		}).start();
	}



	


	
}

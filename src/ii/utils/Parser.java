package ii.utils;

import ii.main.Main;

import java.io.File;
import java.io.IOException;
import java.util.Arrays;

import org.apache.commons.io.FileUtils;
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
			"png",
			"gif",
			"mp4",
			"mp3",
			"wav",
			"mov",
			"flv",
			"webm",
			"avi",
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
			"apk"
	};
	
	
	public static void parse(String url){
		new Thread(new Runnable(){
			@Override
			public void run(){
				Document doc = null;
				Connection con = Jsoup.connect(url).timeout(10000);
				
				try {
					doc = con.get();
				} catch (IOException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}

				Elements link_elements = doc.select("[href], [src]");
				Elements text_elements = doc.select("p");
				for (Element element : link_elements) {
					String href = "";
					String node_name = element.nodeName();
					if(node_name.equals("a")){href = element.absUrl("href");}else{
						href = element.absUrl("src");
					}

					if(isParsable(href)){
						Main.URLS.add(href);
					}
					Main.URLS.remove(url);

				}
				
				for(Element element : text_elements){
					String text = element.text();
					Main.sqlite.query("INSERT INTO paragraphs (paragraphText) VALUES('"+text+"');");
				}

			}
		}).start();

	}

	private static boolean isParsable(String url){
		boolean parsable = true;
		String extension = FilenameUtils.getExtension(url);
		if(Arrays.asList(extensions).contains(extension)){
			parsable = false;
		}

		return parsable;
	}
}

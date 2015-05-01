package ii.utils;

import ii.main.Main;

import java.io.IOException;
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
		new Thread(new Runnable(){
			@Override
			public void run(){
				Document doc = null;
				Connection con = Jsoup.connect(url);
				con.timeout(10000);

				try {
					doc = con.get();
				} catch (IOException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}

				Elements link_elements = doc.select("[href], [src]");
				Elements paragraph_elements = doc.select("p");

				for (Element element : link_elements) {
					String href = "";

					if(element.absUrl("href").isEmpty()){
						href = element.absUrl("src");
					}else{
						href = element.absUrl("href");
					}

					if(href.equals("")){
						return;
					}

					if(isParsable(href)){
						Main.URLS.add(href);
					}else{
						Main.DOWNLOADS.add(href);
					}



				}

				for(Element element : paragraph_elements){
					String text = element.text();
					String[] words = text.split(" ");

					for(int i = 0; i < words.length; i++){
						String word = words[i]
								.replace("'", "")
								.replace("?", "")
								.replace("(", "")
								.replace(")", "")
								.replace(".", "")
								.replace(",", "");
						String word_type = "word";
						String prev_word = words[Math.max(i-1, 0)];
						String next_word = words[Math.min(words.length-1, i+1)];

						if(next_word.equals("is") || next_word.equals("are") || next_word.equals("will") || next_word.equals("can")){
							word_type = "object";
						}
						else if(prev_word.equals("is")){
							word_type = "describing";
						}

						Main.sqlite.query("REPLACE INTO words (wordName, wordType) VALUES('"+word+"', '"+word_type+"')");
					}
				}
				Main.URLS.remove(url);
			}
		}).start();

	}

	private static boolean isParsable(String url){
		boolean parsable = true;
		String extension = FilenameUtils.getExtension(url);
		if(Arrays.asList(extensions).contains(extension) || extension.contains("?")){
			parsable = false;
		}

		return parsable;
	}
}

package ii.main;

import ii.utils.Dumpster;
import ii.utils.Parser;
import ii.utils.SQLite;

import java.util.ArrayList;
import java.util.Random;
import java.util.Set;
public class Main{

	public static SQLite sqlite = new SQLite();
	public static String foldername = "random";
	static Random random = new Random();
	public static ArrayList<String> URLS = new ArrayList<String>();
	public static ArrayList<String> VISITED_URLS = new ArrayList<String>();
	

	public static void main(String[] args){
		URLS.add("http://gotene.se/index.html");
		
		URLS.add("https://news.ycombinator.com/");
		URLS.add("http://reddit.com/");
		URLS.add("https://github.com/");
		URLS.add("http://bralankar.webs.com/");
		URLS.add("http://www.kreativpedagogik.se/");
		URLS.add("http://www.lankar.se/");
		URLS.add("http://www.reddit.com/domain/imgur.com/");
		
		new Main();
		new Dumpster();
	}

	public Main(){

		new Thread(new Runnable(){
			@Override
			public void run(){
				while(true){
					while(URLS.size() > 0){
						
						if(threadCount() < 60){
							int urlID = random.nextInt(URLS.size());
							String url = URLS.get(urlID);
							while(VISITED_URLS.contains(url)) {
								urlID = random.nextInt(URLS.size());
								url = URLS.get(urlID);
							}
							
							if(VISITED_URLS.size() >= 10000) {
								System.out.println("Dumping history");
								VISITED_URLS.clear();
							}
							final String safeurl = url.replaceAll("'", "");
							if(Main.sqlite.urlExists(safeurl)){
								continue;
							}else{
								Main.sqlite.query("INSERT INTO History (url) VALUES ('" + safeurl +"');");
								//System.out.println("FOUND: " + url);
								Parser.parse(url);
							}
						}else{
							try{Thread.sleep(1000);} catch(Exception e){}
						}
					}
					System.out.println("WAITING FOR URLS");
					try{Thread.sleep(2000);} catch(Exception e){}
				}
			}
		}).start();
	}


	public static int threadCount(){
		Set<Thread> threadSet = Thread.getAllStackTraces().keySet();
		return threadSet.size();
	}

}

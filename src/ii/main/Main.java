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
		URLS.add("http://www.gotene.se/index.html");
		new Main();
		new Dumpster();
	}

	public Main(){

		new Thread(new Runnable(){
			@Override
			public void run(){
				while(true){
					while(URLS.size() > 0){
						if(threadCount() < 30){
							int urlID = random.nextInt(URLS.size());
							String url = URLS.get(urlID);
							while(VISITED_URLS.contains(url)){
								urlID = random.nextInt(URLS.size());
								url = URLS.get(urlID);
							}
							
							
							if(VISITED_URLS.size() >= 10000){
								System.out.println("Dumping history");
								VISITED_URLS.clear();
							}
							
							Parser.parse(url);

						}

					}

				}
			}
		}).start();
	}








	public static int threadCount(){
		Set<Thread> threadSet = Thread.getAllStackTraces().keySet();
		return threadSet.size();
	}

}

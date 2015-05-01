package ii.main;

import ii.utils.Parser;
import ii.utils.SQLite;

import java.io.File;
import java.util.ArrayList;
import java.util.Random;
import java.util.Set;
public class Main {

	public static SQLite sqlite = new SQLite();

	static Random random = new Random();
	public static ArrayList<String> URLS = new ArrayList<String>();
	public static ArrayList<String> DOWNLOADS = new ArrayList<String>();

	public static void main(String[] args){
		File dir = new File("data");
		dir.mkdirs();
		URLS.add("http://stackoverflow.com/questions/2717590/sqlite-upsert-on-duplicate-key-update");
		new Main();
	}

	public Main(){

		new Thread(new Runnable(){
			@Override
			public void run(){
				while(true){
					while(URLS.size() > 0){
						if(threadCount() < 100){

							String url = URLS.get(random.nextInt(URLS.size()));
							System.out.println("Parsing: "+url);
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

package ii.main;

import ii.utils.Parser;
import ii.utils.SQLite;

import java.io.File;
import java.sql.DriverManager;
import java.util.ArrayList;
import java.util.Random;
import java.util.Set;

public class Main implements Runnable {

	Thread parse_thread = new Thread(this);
	public static SQLite sqlite = new SQLite();

	static Random random = new Random();
	public static ArrayList<String> URLS = new ArrayList<String>();

	public static void main(String[] args){
		File dir = new File("data");
		dir.mkdirs();
		URLS.add("http://www.4chan.org");
		new Main();
	}

	public Main(){
		parse_thread.start();
	}

	@Override
	public void run() {
		while(true){
			while(URLS.size() > 0){
				if(threadCount() < 60){
					String url = get_next_url();
					System.out.println(url);
					Parser.parse(url);
				}
			}
		}

	}

	private String get_next_url(){
		return URLS.get(random.nextInt(URLS.size()));
	}

	public static int threadCount(){
		Set<Thread> threadSet = Thread.getAllStackTraces().keySet();
		return threadSet.size();
	}
}

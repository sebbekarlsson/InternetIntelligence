package ii.utils;
import ii.main.Main;

import java.io.File;
import java.io.FileNotFoundException;
import java.net.URL;
import java.util.ArrayList;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;


public class Dumpster implements Runnable{
	
	Thread thread = new Thread(this);
	public static ArrayList<String> DOWNLOADS = new ArrayList<String>();
	public static ArrayList<String> SQLS = new ArrayList<String>();
	
	public Dumpster(){
		thread.start();
	}

	@Override
	public void run() {
		while(true){
			try {
				Thread.sleep(10);
			} catch (InterruptedException e1) {
				e1.printStackTrace();
			}
			for(int i = 0; i < DOWNLOADS.size(); i++){
				String url = DOWNLOADS.get(i);
				DOWNLOADS.remove(i);
				// TODO Better than System.out.println("GET: "+url);
				String filename = FilenameUtils.getName(url);
				String abspath = FilenameUtils.getPath(filename).toString();
				
				String foldername = "data/"+DomainUtils.getDomainName(url)+"/"+FilenameUtils.getExtension(filename);
				File folder = new File(foldername);
				if(!folder.exists()){
					folder.mkdirs();
					folder.mkdir();
				}
				
				try {
					FileUtils.copyURLToFile(new URL(url), new File(foldername+"/"+filename));
					Main.itemsDownloaded++;
				} catch (FileNotFoundException e) {
					// TODO Better than System.err.println("404: " + url);
				} catch (Exception e) {
					e.printStackTrace();
				} 
			}
		}
	}
}

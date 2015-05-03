package ii.utils;
import ii.main.Main;

import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;

public class Dumpster implements Runnable{
	
	Thread thread = new Thread(this);
	public static ArrayList<String> DOWNLOADS = new ArrayList<String>();
	
	public Dumpster(){
		thread.start();
	}

	@Override
	public void run() {
		/*while(true){
			try {
				Thread.sleep(10);
			} catch (InterruptedException e1) {
				// TODO Auto-generated catch block
				e1.printStackTrace();
			}
			for(int i = 0; i < DOWNLOADS.size(); i++){
				String url = DOWNLOADS.get(i);
				String filename = FilenameUtils.getName(url);
				try {
					FileUtils.copyURLToFile(new URL(url), new File("uploads/"+filename));
					SQLite.query("INSERT INTO images (imageFilename, imageText, folderName, userID) VALUES('"+filename+"', '"+TextGenerator.getSentence()+"', '"+Main.foldername+"', 0)");
				} catch (MalformedURLException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				} catch (IOException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
				DOWNLOADS.remove(i);
				
			}
		}*/
	}
}

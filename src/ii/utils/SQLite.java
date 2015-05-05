package ii.utils;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

public class SQLite {
	public static Connection connection;
	public SQLite(){
		try {
			DriverManager.registerDriver(new org.sqlite.JDBC());
			connection = DriverManager.getConnection("jdbc:sqlite:/Users/Philip/git/InternetIntelligence/data.sqlite");
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	
	public synchronized void query(String q){
		try {
			Statement statement = connection.createStatement();
			statement.setQueryTimeout(30);
			statement.execute(q);
			statement.close();
		} catch (SQLException e) {
			e.printStackTrace();
		}
	}
	
	public synchronized boolean urlExists(String url){
		try {
			Statement statement = connection.createStatement();
			statement.setQueryTimeout(30);
			ResultSet rs = statement.executeQuery("SELECT count(*) as i FROM History WHERE url = '"+url+"';");
			if(rs.getInt("i") > 0){
				rs.close();
				statement.close();
				return true;
			}else{
				rs.close();
				statement.close();
				return false;
			}
		} catch (SQLException e) {
			e.printStackTrace();
		}
		return false;
	}
}

package ii.utils;

import java.net.URI;
import java.net.URISyntaxException;

public class DomainUtils {
	public static String getDomainName(String url){
		URI uri;
		String domain = "unknown.unknown";
		try {
			uri = new URI(url);
			domain = uri.getHost();
			return domain.startsWith("www.") ? domain.substring(4) : domain;
		} catch (URISyntaxException e) {
			e.printStackTrace();
		}
		
		return domain;

	}
}

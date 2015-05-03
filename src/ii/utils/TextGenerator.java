package ii.utils;

import java.util.Random;

public class TextGenerator {
	public static String[] sentences = new String[]{
			"What do you think about this?",
			"This picture is not very nice!",
			"Wow this is ...",
			"Hahah!",
			"Hmm...",
			"Pls respond",
			"Cool",
			"I am so sorry for posting this",
			"This is great!",
			"Weird",
			"I have no words",
			"I did not know this",
			"This pic is cool!"
	};
	
	public static String getSentence(){
		Random random = new Random();
		return sentences[random.nextInt(sentences.length)];
	}
}

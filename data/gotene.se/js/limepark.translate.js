var globalText={textClose:"Stäng",textDefaultTranslateLanguage:"en", textDefauldDDOption:"Select language"};

jQuery.fn.handleTranslate = function(){
	if(this.size() > 0){
		var link = $svjq(this);
		var cont = link.parent("li");
		var translateDiv = $svjq(document.createElement("div")).addClass("translate");
		$svjq(this).toggle(function() {
			if(cont.find(".translate").size() === 0){
				var loaded = function(){

					// FROM GLOBALJAVASCRIPT
					var translateImage = "http://www.ostersund.se/images/18.63d22a4d12631dd9bf38000419/Google-logo.gif";
					var translateImageAlt = "Google";

					var img = $svjq(document.createElement("img"));
					img.attr("src",translateImage);
					img.attr("alt", translateImageAlt);

					var close = $svjq(document.createElement("a"));
					close.addClass("close");
					close.attr("href", "#");

					close.click(function() {
						link.trigger("click");
						return false;
					});

					var closeSpan = $svjq(document.createElement("span"));
					closeSpan.text("Close");
					
					close.append(closeSpan);
					
					var translateParagraph = $svjq(document.createElement("span"));
					translateParagraph.html("<br />Use Google to translate the web site. We take no responsibility for the accuracy of the translation.");
					translateParagraph.addClass("litenlank");
					var formHolder = $svjq(document.createElement("p"));
					
					var label = $svjq(document.createElement("label"));
					label.text(globalText.textDefauldDDOption);
					label.attr("for", "translateSelect");
					
					var select = $svjq(document.createElement("select"));
					select.attr("id", "translateSelect");
					
					var FirstOption = $svjq(document.createElement("option"));
					FirstOption.val("-1");
					FirstOption.text(globalText.textDefauldDDOption);
					select.append(FirstOption);
					
					for (var i in google.language.Languages) {
						if(i !== "UNKNOWN" && google.language.isTranslatable(google.language.Languages[i])){
							var option = $svjq(document.createElement("option"));
							option.val(google.language.Languages[i]);
							option.text(i.replace("_", " "));
							select.append(option);
						}
					}
					select.addClass("brodtext");
					
					select.change(function() {
						var lang = select.find("option:selected").attr("value");
						document.location.href = link.attr("href").replace("hl=" + globalText.textDefaultTranslateLanguage, "hl=" + lang).replace("tl=" + globalText.textDefaultTranslateLanguage, "tl=" + lang);
					});

					label.hide();
					//formHolder.append(label);
					//formHolder.append(select);

					//translateDiv.prepend(formHolder);
					
					translateDiv.append(img);
					translateDiv.append(label)
					translateDiv.append(select);
					translateDiv.append(translateParagraph);
					translateDiv.prepend(close);
					
					translateDiv.addClass("active");
					if($svjq.browser.msie){
						$svjq("#navigation").css("z-index","1");
					}
					cont.append(translateDiv);
					return false;
					
				};
				$svjq.getScript('http://www.google.com/jsapi?', function(){
					google.load('language', '1', {'callback' : loaded});
				});
			}else{
				translateDiv.addClass("active");
				if($svjq.browser.msie){
					$svjq("#navigation").css("z-index","1");
				}
			}
			
		}, function() {
			translateDiv.removeClass("active");
			if($svjq.browser.msie){
				$svjq("#navigation").css("z-index","-1");
			}
			return false;
		});
		
	}
	return this;
};

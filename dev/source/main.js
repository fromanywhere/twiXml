var twiXml = (function($) {

	var twiXmlParams = {
		$feed: false,
		lastTimeStamp: 0,
		language: 'rus',
		server: 'twitter.com',
		query: '',
		refresh: true,
		onCreate: function () {},	
		onRefresh: function () {}		
	}
	
	var createFeed = function () {  
		!twiXmlParams.$feed
			? twiXmlParams.$feed = twiXmlParams
									.$block
										.append('<ul class="twixml"></ul>')
			: false;
	}
	
	var appendPost = function (postData) {
		var postTemplate = '<li class="twixml__post"> \
								<div class="twixml__post-header"> \
									<a href="' +  postData.profileLink + '" class="twixml__profile-link"> \
										<img src="http://twitter.com/api/users/profile_image/' +  postData.profileTitle + '" alt="" class="twixml__profile-avatar" /> \
										<span class="twixml__profile-title">' +  postData.profileTitle + '</span> \
									</a> \
									\
									<a href="' +  postData.postLink + '" class="twixml__post-date">' +  postData.postDate + '</a> \
								</div> \
								<div class="twixml__post-content">' +  postData.postContent + '</div> \
							</li>';	
							
		twiXmlParams.$feed.prepend(postTemplate);
	}
	
	var getSearchResult = function () {
		
		var blogSearchQueryString = encodeURIComponent('http://blogs.yandex.ru/search.rss?text=' + twiXmlParams.query + '&server=' + twiXmlParams.server + '&lang=' + twiXmlParams.language);
		var queryURL = 'http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20xml%20where%20url%3D%22' + blogSearchQueryString + '%22&format=json';

		$.ajax({
			url: queryURL,
			type: 'get',
			dataType: 'jsonp',
			success: function(result) {
				createFeed();
				var rssItems = result.query.results.rss.channel.item;
				
				for (var item=9; item>=0; item--) {

					var timeStamp = new Date(rssItems[item].pubDate).getTime();
					if (timeStamp <= twiXmlParams.lastTimeStamp) {
						continue;
					}
					
					twiXmlParams.lastTimeStamp = timeStamp;
					
					appendPost({
						profileLink: rssItems[item].journal.url,
						profileTitle: rssItems[item].journal.content,
						postLink: rssItems[item].link,
						postDate: rssItems[item].pubDate,
						postContent: rssItems[item].description
					})
				}
				
				twiXmlParams.onRefresh();
			}
		})	
		
	}
	
	var activeTabCheck = function () {
		$(window).focus(function() {
			if (!twiXmlParams.$feed) {
				return false;
			} else {				
				if (twiXmlParams.refresh) {
					getSearchResult();
					clearInterval( twiXmlParams.refresh );
					twiXmlParams.refresh = setInterval(function() {
						getSearchResult();
					}, 30000)
				}				
				return true;
			}
		});

		$(window).blur(function() {
			if (twiXmlParams.refresh)
				clearInterval( twiXmlParams.refresh );
		});	
	}
	
	return {
		init: function(params) {
			twiXmlParams = $.extend(twiXmlParams, params);	
			twiXmlParams.onCreate();	
			
			getSearchResult();
			if (twiXmlParams.refresh) {
				twiXmlParams.refresh = setInterval(function() {
					getSearchResult();
				}, 30000)
			}
			
			//activeTabCheck();
						
			return this;
		},
		refresh: function() {
			if (!twiXmlParams.$feed) {
				return false;
			} else {
				getSearchResult();
				
				if (!twiXmlParams.refresh) {
					clearInterval( twiXmlParams.refresh );
					twiXmlParams.refresh = setInterval(function() {
						getSearchResult();
					}, 30000)
				}				
				return true;
			}
		}
	}
})(jQuery)

jQuery.fn.twiXml = function(options){
	this.each(function() {
		options.$block = jQuery(this);
		jQuery(this).data('twixml', twiXml.init(options))
  	});
};


$(function() {
	$('.wrapper').twiXml({
		query: 'rosuznik'
	})
})
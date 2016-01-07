`
// DocPad Configuration File
// http://docpad.org/docs/config

var docpadConfig = {
	collections: {
		pages: function(){
				return this.getCollection("html").findAllLive({relativeOutDirPath: "."}, [{order: 1}]);
		},
		posts: function(){
				return this.getCollection("html").findAll({relativeOutDirPath: "blog"});
		},
		projects: function(){
			var projects = this.getCollection("html").findAllLive({relativeOutDirPath: "projects"});
			projects.on("add", function(model){
				model.setMetaDefaults({
					layout: "page"
				});
			});
			return this.getCollection("html").findAll({relativeOutDirPath: "projects"});
		}
	},
  plugins: {
    cleanurls: {
      static: true
    }
  }
}

module.exports = docpadConfig;
`

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
					layout: "contentpage"
				});
			});
			return projects;
		}
	},
  plugins: {
    cleanurls: {
      static: true
    },
		moment: {
			formats: [
				{
					raw: "date",
					format: "MMMM Do, YYYY",
					formatted: "formattedDate"
				}
			]
		}
  }
}

module.exports = docpadConfig;

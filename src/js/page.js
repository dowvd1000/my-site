let apiUrl = "https://api.dow.x10.mx/proxy/v1/";
let commentUrl = "https://api.dow.x10.mx/wp-json/wp/v2/comments";
let local = false;
let id;

if (window.location.hostname == "localhost") {
	apiUrl = "http://localhost/api/proxy/v1/";
	commentUrl = "http://localhost/content/wp-json/wp/v2/comments";
	local = true;
}

/**
 * UNIX Timestamp to date.
 * https://stackoverflow.com/questions/847185/convert-a-unix-timestamp-to-time-in-javascript
 * @param {int} timestamp - UNIX timestamp
 * @return {string} Parsed date
 */
function timeConverter(timestamp){
	const a = new Date(timestamp * 1000);
	const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
	const year = a.getFullYear();
	const month = months[a.getMonth()];
	const date = a.getDate();
	const hour = a.getHours();
	const min = a.getMinutes();
	//const sec = a.getSeconds();
	const time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min; //+ ':' + sec ;
	return time;
}

/**
 * Parses and returns formated date.
 * @param {string} date - Date to parse
 * @return {string} Returns date yyyy/mm/dd
 */
function parseDate(date) {
	let month;
	let day;
	const newDate = new Date(Date.parse(date));
	if ((newDate.getMonth() + 1) > 9) {
		month = newDate.getMonth() + 1;
	} else { // Add 0 so length is 2.
		month = `0${newDate.getMonth() + 1}`
	}
	if (newDate.getDate() > 9) {
		day = newDate.getDate();
	} else { // Add 0 so length is 2.
		day = `0${newDate.getDate()}`;
	}
	return `${newDate.getFullYear()}/${month}/${day}`;
}

/**
 * Set page values.
 * @param {string} title
 * @param {string} content
 */
function setPage(title, content) {
	const can = document.createElement("link");
	can.rel = "canonical";
	can.href = `${window.location.protocol}//${window.location.hostname}${window.location.pathname}`;
	document.head.appendChild(can);
	document.title = `${title} — ${document.getElementsByTagName("title")[0].textContent}`;
	document.querySelector('meta[name="description"]').setAttribute("content", title);
	document.getElementById("content").innerHTML = content;
}

/**
 * Page error handler.
 * @param {var} set - Type of error (404, fail)
 * @param {string} url - Url of page if 404 error
 */
function pageError(set, url) {
	const noIndex = document.createElement("meta");
	noIndex.name = "robots";
	noIndex.content = "noindex";
	document.head.appendChild(noIndex);
	if (set == 404) {
		setPage("404 Not Found", `
			<article class="page">
				<h1>Not Found</h1>
				<p>The requested URL ${url} was not found on this server.</p>
				<p><small><a href="mailto:webmaster@dow.x10.mx">webmaster@dow.x10.mx</a></small></p>
			</article>
		`);
	} else if (set == "fail") {
		setPage("Error", `
			<article class="page">
				<h1>Site Error</h1>
				<p>There was an error while loading the page.</p>
				<p><small><a href="mailto:webmaster@dow.x10.mx">webmaster@dow.x10.mx</a></small></p>
			</article>
		`);
	}
	loadSteam();
}

/**
 * Parse and set post comments.
 * @param {int} id - Post id
 */
function loadComments(id) {
	fetch(`${apiUrl}?type=comments&id=${id}`).then((response) => {
    	return response.text();
    }).then((data) => {
		const commentItems = new Array();
		commentItems.push("<h4><strong>Comments</strong></h4>");
		const parser = new DOMParser();
		const xml = parser.parseFromString(data,"text/xml");
		xml.getElementsByTagName("comments")[0].childNodes.forEach(x => {
			const node = x.childNodes;
			try {
				commentItems.push(`
					<div class="post-comments">
						<p><strong>${node[0].innerHTML}</strong> - ${parseDate(node[1].innerHTML)}</p>
						<p>${node[2].innerHTML}</p>
					</div>
				`);
			} catch {
				commentItems.push(`
					<em>${node[0].innerHTML}</em>
				`);
			}
		});
		document.getElementById("post-comments").innerHTML = commentItems.join("");
    });
}

/**
 * Load other posts to post page.
 * @param {string} leaveout - post not to show
 */
function loadOtherPosts(leaveout) {
	fetch(`${apiUrl}?type=links`).then((response) => {
    	return response.text();
    }).then((data) => {
		const postItems = new Array();
		const parser = new DOMParser();
		const xml = parser.parseFromString(data,"text/xml");
		postItems.push(`<li><h1>Other Posts</h1></li>`);
		xml.getElementsByTagName("posts")[0].childNodes.forEach(x => {
			let node = x.childNodes;
			if (node[1].innerHTML != leaveout) {
  				postItems.push(`
					<li><a href="/${node[0].innerHTML}/${node[1].innerHTML}">${node[2].innerHTML}</a></li>
				`);
  			}
		});
		document.getElementById("other-posts").innerHTML = postItems.join("");
    });
}

/**
 * Load page.
 * @param {string} page - Page slug
 * @param {string} type - Page type
 */
function loadPage(page, type) {
	if (page != undefined) {
		if (type == "page" || type == "post") {
			fetch(`${apiUrl}?type=${type}&slug=${page}`).then((response) => {
    			return response.text();
    		}).then((data) => {
    			let pageContent;
    			const parser = new DOMParser();
				const xml = parser.parseFromString(data,"text/xml");
				try {
					let comment = false;
					const node = xml.getElementsByTagName(type)[0].childNodes;
					if (type == "post") {
						const tags = JSON.parse(node[3].innerHTML);
						id = node[4].innerHTML;
						if (node[5].innerHTML != "closed") comment = true;
						const tagsAll = new Array();
						tagsAll.push(`<sup>${parseDate(node[1].innerHTML)}</sup>`);
						tags.forEach(tag => {
							tagsAll.push(`<sup>${tag}</sup>`);
						});
						pageContent = `
							<nav class="sidebar">
								<ul id="other-posts">
									<li>Loading...</li>
								</ul>
							</nav>
							<article>
								<h1 class="title">${node[0].innerHTML}</h1>
            					${node[2].innerHTML}
            					${tagsAll.join("")}
            					<div id="post-comments"><p>Loading...</p></div>
            					<div>
            						<form name="form" id="comment-form">
    									<div>
    										<input type="text" name="name" placeholder="Name" required>
    									</div>
    									<div>
    										<input type="email" name="email" placeholder="Email" required>
    									</div>
    									<div>
    										<input type="text" name="content" placeholder="Comment" required>
    									</div>
    									<input type="submit" value="Post" class="post-button">
									</form>
            					</div>
            				</article>
						`;
					} else if (type == "page") {
						pageContent = `
							<article class="page">
								<h1 class="title">${node[0].innerHTML}</h1>
	            				${node[1].innerHTML}
	            			</article>
						`;
					}
					setPage(node[0].innerHTML, pageContent);
					if (type == "post") {
						if (comment) {
							loadComments(id);
						} else {
							document.getElementById("comment-form").style.display = "none";
							document.getElementById("post-comments").style.display = "none";
						}
						const form = document.getElementById("comment-form");
						form.addEventListener("submit", function (e) {
        					e.preventDefault();
        					let formdata = new FormData(this);
        					let name = formdata.get("name");
        					let email = formdata.get("email");
        					let content = formdata.get("content");
							let data = {
								author_email: email,
								author_name: name,
								content: content,
								post: id
							};
							fetch(commentUrl, {
								method: "POST",
								headers: {
						      		"Content-Type": "application/json",
						    	},
						    	body: JSON.stringify(data)
							}).then((response) => {
								if (response.ok === true) {
									loadComments(id);
									form.reset();
								} else {
									alert(response.statusText);
								}
							});
						});
					}
					loadOtherPosts(page);
					loadSteam();
				} catch (e) {
					pageError(404, window.location.pathname)
				}
    		});
		} else {
			pageError(404, window.location.pathname)
		} 
	} else {
		pageError(404, window.location.pathname)
	}
}

/**
 * Loads posts on home page.
 */
function loadHome() {
	fetch(`${apiUrl}?type=links`).then((response) => {
    	return response.text();
    }).then((data) => {
		const homeItems = new Array();
		const parser = new DOMParser();
		const xml = parser.parseFromString(data,"text/xml");
		homeItems.push(`<ul class="home">`);
		xml.getElementsByTagName("posts")[0].childNodes.forEach(x => {
			let node = x.childNodes;
  			homeItems.push(`
  				<li>
					<section>
						<aside>
							<a href="/${node[0].innerHTML}/${node[1].innerHTML}">
								<h1>${node[2].innerHTML}</h1>
								<sup>${parseDate(node[3].innerHTML)}</sup><br>
								<small>${node[4].innerHTML}</small>
							</a>
						</aside>
					</section>
				</li>
			`);
		});
		homeItems.push("</ul>");
		setPage("Home", homeItems.join(""));;
		loadSteam();
    });
}

/**
 * Get my status from Steam api.
 * https://developer.valvesoftware.com/wiki/Steam_Web_API#GetPlayerSummaries_.28v0001.29
 * @param {string} key - Steam dev key
 * @param {string} id - Steam user id
 */
function loadSteam() {
	if (local == false) {
		fetch(`${apiUrl}?type=steam`).then((response) => {
	    	return response.json();
	    }).then((data) => {
	    	const info = data.response.players[0];
			
			let i = "";

			if (info.personastate == 0) {
				i = `${i} Online last ${timeConverter(info.lastlogoff)}`;
				document.getElementById("steam-info").innerHTML = i;
			} else if (info.personastate == 1) {
				i = `${i} Online`;
				if (info.gameextrainfo != undefined) i = `${i} playing ${info.gameextrainfo}`;
				document.getElementById("steam-info").innerHTML = i;
			} else if (info.personastate == 2) {
				i = `${i} Busy`;
				document.getElementById("steam-info").innerHTML = i;
			} else if (info.personastate == 3) {
				i = `${i} Away`;
				document.getElementById("steam-info").innerHTML = i;
			} else if (info.personastate == 4) {
				i = `${i} Snooze`;
				document.getElementById("steam-info").innerHTML = i;
			} else if (info.personastate == 5) {
				i = `${i} Looking to Trade`;
				document.getElementById("steam-info").innerHTML = i;
			} else if (info.personastate == 6) {
				i = `${i} Looking to Play`;
				document.getElementById("steam-info").innerHTML = i;
			}
	    });
	} else {
		document.getElementById("steam-info").innerHTML = "Offline";
	}
}

/**
 * main
 */
function getPage() {
	let location = window.location.pathname;
	const path = location.split("/");
    if (location.length == 0) location = "/";
    if (path[1] != "") {
    	loadPage(path[2], path[1]);
    } else if (location == "/") {
    	loadHome();
    } else {
    	pageError(404, location);
	}
}

window.addEventListener("hashchange", getPage);
getPage();

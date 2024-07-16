<?php
include "config.php";
if ($_SERVER["REQUEST_METHOD"] == "GET") {
	$type = htmlspecialchars($_GET["type"]);
	if ($type == "comments") {
		$id = htmlspecialchars($_GET["id"]);
		header("Content-Type: application/xml");
		echo '<?xml version="1.0" encoding="UTF-8"?>';
		echo "<comments>";
		$len = strlen(file_get_contents(URL."/comments?post=".$id));
		if ($len > 2) {
			foreach (json_decode(file_get_contents(URL."/comments?post=".$id)) as $item) {
				$str = $item->content->rendered;
				$str = str_replace("\n", '', $str);
				$str = str_replace("<p>", "", $str);
				$str = str_replace("</p>", "", $str);
				echo "<comment>";
				echo "<author_name>".$item->author_name."</author_name>";
				echo "<date>".$item->date."</date>";
				echo "<content>".$str."</content>";
				echo "</comment>";
			}
		} else {
			echo "<comment>";
			echo "<message>No Comments.</message>";
			echo "</comment>";
		}
		echo "</comments>";
	} elseif ($type == "links") {
		header("Content-Type: application/xml");
		echo '<?xml version="1.0" encoding="UTF-8"?>';
		echo "<links><posts>";
		foreach (json_decode(file_get_contents(URL."/posts?".mt_rand())) as $item) {
			$str = $item->excerpt->rendered;
			$str = str_replace("\n", "", $str);
			$str = str_replace("<p>", "", $str);
			$str = str_replace("</p>", "", $str);
			$str = substr($str, 0, 100);
    		echo "<post>";
    		echo "<type>".$item->type."</type>";
    		echo "<slug>".$item->slug."</slug>";
    		echo "<title>".$item->title->rendered."</title>";
    		echo "<date>".$item->date."</date>";
    		echo "<excerpt>".$str."...</excerpt>";
    		echo "</post>";
		}
		echo "</posts></links>";
	} elseif ($type == "post") {
		$slug = htmlspecialchars($_GET["slug"]);
		header("Content-Type: application/xml");
		echo '<?xml version="1.0" encoding="UTF-8"?>';
		echo "<post>";
		foreach (json_decode(file_get_contents(URL."/posts?slug=".$slug."&".mt_rand())) as $item) {
			$str = $item->content->rendered;
			$str = str_replace("\n", '', $str);
			$str = str_replace('"', "'", $str);
    		echo "<title>".$item->title->rendered."</title>";
    		echo "<date>".$item->date."</date>";
    		echo "<content>".$str."</content>";
    		echo "<tags>[";
    		$maxTags = count($item->tags);
    		$countTags = 0;
    		foreach ($item->tags as $tag) {
    			$tagdata = json_decode(file_get_contents(URL."/tags/".strval($tag)));
    			$countTags += 1;
    			echo '"'.$tagdata->name.'"';
    			if ($countTags != $maxTags) {
    				echo ",";
    			}
    		}
    		echo "]</tags>";
    		echo "<id>".$item->id."</id>";
    		echo "<comment-status>".$item->comment_status."</comment-status>";
		}
		echo "</post>";
	} elseif ($type == "page") {
		$slug = htmlspecialchars($_GET["slug"]);
		header("Content-Type: application/xml");
		echo '<?xml version="1.0" encoding="UTF-8"?>';
		echo "<page>";
		foreach (json_decode(file_get_contents(URL."/pages?slug=".$slug."&".mt_rand())) as $item) {
			$str = $item->content->rendered;
			$str = str_replace("\n", '', $str);
			$str = str_replace('"', "'", $str);
    		echo "<title>".$item->title->rendered."</title>";
    		echo "<content>".$str."</content>";
		}
		echo "</page>";
	} elseif ($type == "steam") {
		header("Content-Type: application/json");
		echo(file_get_contents("http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=".STEAM_KEY."&steamids=".STEAM_ID));
	}
}
?>

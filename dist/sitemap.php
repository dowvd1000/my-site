<?php
define("URL", "https://api.dow.x10.mx/wp-json/wp/v2");
header("Content-Type: application/xml");
echo '<?xml version="1.0" encoding="UTF-8"?>';
echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
echo "<url>";
echo "<loc>https://dow.x10.mx/</loc>";
echo "</url>";
foreach (json_decode(file_get_contents(URL."/pages")) as $item) {
	echo "<url>";
	echo "<loc>https://dow.x10.mx/".$item->type."/".$item->slug."</loc>";
	echo "</url>";
}
foreach (json_decode(file_get_contents(URL."/posts")) as $item) {
	echo "<url>";
	echo "<loc>https://dow.x10.mx/".$item->type."/".$item->slug."</loc>";
	echo "</url>";
}
echo '</urlset>';
?>

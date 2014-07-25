<?php

	include('server_config.php');
	
	// connexion de base ....
	mysql_connect($host,$user,$pass);
	mysql_select_db("$bdd"); 
  ?>

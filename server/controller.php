<?php

include ('motus.php');
include ('db_connect.php');

$motus = new Motus();

session_start();
header('Access-Control-Allow-Origin: *');

if ($_REQUEST['action']=="getWord"){
	if(isset($_REQUEST['length'])){
		$mot = $motus->getAWord($_REQUEST['length'], $_REQUEST['lang']);
	}
	else {
		$mot = $motus->getAWord();
	}
	$_SESSION['word'] = $mot;

	echo json_encode( array ('status'=> 'success', "word"=>$motus->encodeWord($mot),"firstLetter"=>substr($mot,0,1)) );
}

if ($_REQUEST['action']=="checkWord"){
	echo ('{ "status" : "success", "exists" : "'.$motus->isItARealWord($_REQUEST['word'], $_REQUEST['lang']).'" }');
}

if ($_REQUEST['action']=="theWordWas"){
	echo ('{ "status" : "success", "word" : "'.$_SESSION['word'].'"}');
}

if ($_REQUEST['action']=="getDictionnary"){
	if(isset($_REQUEST['length'])){
		$dico = $motus->getDictionnary($_REQUEST['length'], $_REQUEST['lang'], $_REQUEST['letter']);
	};

	echo json_encode( array ('dictionnary'=>$dico, 'status'=> 'success') );
}

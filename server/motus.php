<?php


class Motus {

	public function getAWord($length = NULL, $lang = 'fr'){
		if ($length!=NULL){
			$sql="SELECT word_text FROM motus_words WHERE length(word_text)=".$length." AND word_lang LIKE '".$lang."' ORDER BY RAND( ) LIMIT 1";
		}
		else {
			$sql="SELECT word_text FROM motus_words ORDER BY RAND( ) LIMIT 1";
		}
		$result = mysql_query($sql)or die(mysql_error());
		while ( $row=mysql_fetch_assoc($result) )
		return $row['word_text'];
	}

	public function encodeWord($word) {
		$larray = str_split($word);
		foreach($larray as $index => $lettre){
			$larray[$index] = md5($lettre);
		}
		return($larray);
	}

	public function isItARealWord($word, $lang) {
		$sql="SELECT word_text FROM motus_words WHERE word_text LIKE '".$word."' AND word_lang LIKE '".$lang."'";

		$result = mysql_query($sql);
		$num_rows = mysql_num_rows($result);
		
		if ($num_rows==0) return 'false'; 
		else return 'true';
	}
	
	public function getDictionnary($length, $lang, $startingwith) {
		
		$sql="SELECT word_text FROM motus_words WHERE word_text LIKE '".$startingwith."%' AND length(word_text)=".$length." AND word_lang LIKE '".$lang."'";

		$result = mysql_query($sql);
		$res = array();
		while ( $row=mysql_fetch_assoc($result) ) $res[] = $row['word_text'];
		
		$num_rows = mysql_num_rows($result);

		if ($num_rows==0) return 'false'; 
		else return ($res);
	}
}

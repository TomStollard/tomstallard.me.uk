<?php

$message = "";

foreach($_POST as $item => $contents){
  $message .= $item . ": " . $contents . "\n";
}

mail("contact@tomstollard.me.uk", "Website Email", $message);
print_r($_POST);

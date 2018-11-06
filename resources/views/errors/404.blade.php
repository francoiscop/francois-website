<!DOCTYPE html>
<html>
<head>
    <title>Page Not Found</title>

<style type="text/css">
@import url("http://fonts.googleapis.com/css?family=Dosis");
@import url("https://fonts.googleapis.com/css?family=Anton");
@import url("https://fonts.googleapis.com/css?family=Roboto+Mono");

body {
	height: 100vh;
    padding: 0;
    margin: 0;
    font-family: Dosis;
    font-family: 'Roboto Mono', monospace;
    font-family: 'Anton', sans-serif;
    font-size: 30px;
    background-color: white;
}
div {
	text-transform: capitalize;
	line-height: 200px;
	border:0px solid red;
	background-image: url("/css/_icons/404.png");
	background-repeat: no-repeat;
	text-indent: 200px;
}
.center-flex{
	display: flex;
	justify-content: center;
    align-items: center;
}
.center-absoute {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translateX(-50%) translateY(-50%);-webkit-transform: translateX(-50%) translateY(-50%); 
}
</style>
</head>
<body class="center-flex">
    <div>Oops ... Page not found</div>
</body>
</html>
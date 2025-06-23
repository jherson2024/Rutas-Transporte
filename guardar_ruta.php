<?php
$conexion = new mysqli("localhost", "root", "1234", "rutas");
if ($conexion->connect_error) {
    die("Conexión fallida: " . $conexion->connect_error);
}

if (isset($_POST['ruta'])) {
    $ruta = $_POST['ruta'];
    $sql = "INSERT INTO rutas (coordenadas) VALUES (?)";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("s", $ruta);
    if ($stmt->execute()) {
        echo "OK";
    } else {
        echo "Error al guardar";
    }
    $stmt->close();
}
$conexion->close();
?>

const express = require("express");
const fs = require("fs");
const app = express();
const port = 3000;

app.use("/css", express.static(__dirname + "/css"));
app.use("/img", express.static(__dirname + "/img"));
app.use("/js", express.static(__dirname + "/js"));

// Middleware para procesar datos de formularios
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Ruta para servir el formulario de reservas
app.get("/reservas", (req, res) => {
  res.sendFile(__dirname + "/reservas.html");
});

// Ruta para procesar el formulario de reservas
app.post("/reservas", (req, res) => {
  const reserva = {
    nombre: req.body.nombre,
    celular: req.body.celular,
    hora: req.body.hora,
    numeroPersonas: req.body.numeroPersonas,
    mesa: req.body.mesa,
  };

  // Leer el archivo JSON existente y añadir la nueva reserva
  fs.readFile("db.json", "utf8", (err, data) => {
    if (err) {
      if (err.code === "ENOENT") {
        console.log("Archivo db.json no encontrado, creando uno nuevo...");
        data = "[]"; // Iniciar con un array vacío
      } else {
        throw err;
      }
    }
    const reservas = JSON.parse(data);
    reservas.push(reserva);

    fs.writeFile("db.json", JSON.stringify(reservas, null, 2), (err) => {
      if (err) throw err;
      console.log("Reserva guardada");
      // Enviar mensaje de confirmación en lugar de redirigir
      res.send(
        '<h1>Reserva exitosa</h1><p>Gracias por reservar. Nos vemos pronto.</p><a href="/reservas">Volver a reservar</a>'
      );
    });
  });
});

// Ruta para ver las reservas realizadas
app.get("/ver-reservas", (req, res) => {
  fs.readFile("db.json", "utf8", (err, data) => {
    if (err) throw err;
    const reservas = JSON.parse(data);
    res.send(`
            <h1>Reservas Realizadas</h1>
            <ul>
                ${reservas
                  .map(
                    (reserva) =>
                      `<li>${reserva.hora} - Mesa ${reserva.mesa} para ${reserva.numeroPersonas} personas: ${reserva.nombre} (${reserva.celular})</li>`
                  )
                  .join("")}
            </ul>
            <a href="/reservas">Volver al formulario</a>
        `);
  });
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor funcionando en http://localhost:${port}`);
});

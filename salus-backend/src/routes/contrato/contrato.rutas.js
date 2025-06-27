// routes/contrato/contrato.rutas.js
const express = require('express');
const router = express.Router();
const db = require('../../db/connection');

// 📌 Crear contrato de seguro (estado pendiente)
router.post('/', (req, res) => {

  const { id_usuario, id_seguro, fechaContrato, fechaFin } = req.body;
  // Validación
  if (!id_usuario || !id_seguro) {
    return res.status(400).send('Faltan campos obligatorios');
  }

  // Fecha actual como fecha de contrato
  //fechaFin.setFullYear(fechaContrato.getFullYear() + 1); // Contrato válido por 1 año

  const sql = `
    INSERT INTO usuario_seguro (
      id_usuario_per,
      id_seguro_per,
      fecha_contrato,
      fecha_fin,
      estado,
      estado_pago
    ) VALUES (?, ?, ?, ?, ?, ?)
  `;

  const values = [
    id_usuario,
    id_seguro,
    fechaContrato,
    fechaFin,
    'pendiente',
    'pendiente'
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('❌ Error al insertar contrato:', err);
      return res.status(500).send('Error al guardar el contrato');
    }
    res.status(201).json({ id: result.insertId });
  });

});

// 📄 Obtener todos los contratos de un usuario
router.get('/usuario/:id', (req, res) => {
  const id_usuario = req.params.id;

  const sql = `
    SELECT us.*, s.nombre, s.tipo
    FROM usuario_seguro us
    JOIN seguro s ON us.id_seguro_per = s.id_seguro
    WHERE us.id_usuario_per = ?
    ORDER BY us.fecha_contrato DESC
  `;

  db.query(sql, [id_usuario], (err, results) => {
    if (err) {
      console.error('❌ Error al obtener contratos:', err);
      return res.status(500).send('Error al obtener contratos');
    }

    res.json(results);
  });
});


module.exports = router;

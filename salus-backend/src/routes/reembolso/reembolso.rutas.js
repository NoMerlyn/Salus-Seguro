const express = require("express");
const router = express.Router();
const db = require("../../db/connection");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ⚠️ Ya existente: Ruta para subir archivos
// ... (NO DUPLICAR)

// ✅ NUEVA RUTA: Obtener reembolsos por id_usuario
router.get("/:id_usuario", (req, res) => {
  const idUsuario = req.params.id_usuario;

  const sql = `
    select
      r.id,
      r.fecha_gasto,
      r.tipo_gasto,
      r.monto_solicitado,
      r.descripcion,
      r.estado,
      r.comprobante
    from
      reembolso r
    inner join usuario_seguro us on
      r.id_usuario_seguro = us.id_usuario_seguro
    inner join usuario u on
      us.id_usuario_per = u.id_usuario
    where
      u.id_usuario =?
  `;

  db.query(sql, [idUsuario], (err, results) => {
    if (err) {
      console.error("Error al consultar reembolsos:", err);
      return res.status(500).json({ error: "Error al consultar reembolsos" });
    }

    // Agrupar por reembolso
    const agrupados = {};
    results.forEach((row) => {
      if (!agrupados[row.id_reembolso]) {
        agrupados[row.id_reembolso] = {
          id: row.id_reembolso,
          fecha: row.fecha_gasto,
          tipo: row.tipo_gasto,
          monto: row.monto,
          descripcion: row.descripcion,
          estado: row.estado,
          archivos: row.comprobante,
        };
      }
      if (row.nombre_archivo) {
        agrupados[row.id_reembolso].archivos.push(
          `https://focuses-inclusive-northeast-came.trycloudflare.com/uploads/reembolsos/${row.nombre_archivo}`
        );
      }
    });

    res.json(Object.values(agrupados));
  });
});

// crear un nuevo regoistro de reembolso
router.post("/:id", (req, res) => {
  const { id } = req.params;
  const { fecha_gasto, tipo_gasto, monto, comprobante, descripcion } = req.body;
  if (!fecha_gasto || !tipo_gasto || !monto || !comprobante || !descripcion) {
    return res.status(400).send('Todos los campos son obligatorios');
  }

  const sql = `
  INSERT INTO reembolso (fecha_gasto, tipo_gasto, monto_solicitado, comprobante, descripcion,id_usuario_seguro)
  VALUES (?, ?, ?, ?, ?, ?)
`;

  db.query(sql, [fecha_gasto, tipo_gasto, monto, comprobante, descripcion, id], (err, result) => {

    if (err) {
      console.log(err);
      return res.status(500).send('Error al crear reembolso');
    }
    res.status(201).json({ id: result.insertId });
  });
})

//obtener todos los registros de los reembolsos
router.get("/", (req, res) => {
  const sql = `
  select
    r.id,
    CONCAT(u.nombre, ' ', u.apellido)as nombrePaciente,
    r.fecha_gasto as fechaAtencion,
    r.monto_solicitado as montoSolicitado,
    r.descripcion,
    r.comprobante,
    r.estado
  from
    reembolso r
  inner join usuario_seguro us on
    r.id_usuario_seguro = us.id_usuario_seguro
  inner join usuario u on
    u.id_usuario = us.id_usuario_per;
  `;

  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).send('Error al obtener Reembolsos');
    }
    res.status(201).json(result);
  });
})

router.patch('/aprobar/:id', (req, res) => {
  const { id } = req.params;

  // Paso 1: Obtener el id_usuario_seguro y monto_solicitado del reembolso que se va a aprobar
  const queryGet = `
    SELECT r.monto_solicitado, r.id_usuario_seguro 
    FROM reembolso r
    WHERE r.id = ?
  `;

  db.query(queryGet, [id], (err, results) => {
    if (err) return res.status(500).send('Error al obtener reembolso: ' + err);
    if (results.length === 0) return res.status(404).send('Reembolso no encontrado');

    const { monto_solicitado, id_usuario_seguro } = results[0];

    // Paso 2: Actualizar la tabla usuario_seguro restando el monto_solicitado a cobertura
    const queryUpdateCobertura = `
      UPDATE usuario_seguro
      SET cobertura = cobertura - ?
      WHERE id_usuario_seguro = ?
    `;

    db.query(queryUpdateCobertura, [monto_solicitado, id_usuario_seguro], (err2, results2) => {
      if (err2) return res.status(500).send('Error al actualizar cobertura: ' + err2);

      // Paso 3: Actualizar el estado del reembolso a 'Aprobado'
      const queryUpdateReembolso = `
        UPDATE reembolso
        SET estado = 'Aprobado'
        WHERE id = ?
      `;

      db.query(queryUpdateReembolso, [id], (err3, results3) => {
        if (err3) return res.status(500).send('Error al actualizar estado del reembolso: ' + err3);

        res.json({ mensaje: 'Reembolso aprobado y cobertura actualizada correctamente' });
      });
    });
  });
});

// rechazar remmbolso
router.patch('/rechazar/:id', (req, res) => {
  const { id } = req.params;

  const sql = `
  update
    reembolso r
  set
    estado = 'Rechazado'
  where
    id = ?
  `
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(404).send('No se pudo actualizar el estado del Reembolso')
    res.json({ mensaje: "estado del Reembolso actualizado", data: results })
  })
})
module.exports = router;

const express = require('express');
const router = express.Router();
const db = require('../../db/connection');
const bcrypt = require('bcrypt');

// ✅ Obtener usuarios activos
// GET http://localhost:3030/usuario/
router.get('/', (req, res) => {
  const sql = 'SELECT id_usuario, nombre, apellido, correo, username, tipo FROM usuario WHERE activo = 1';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al consultar usuarios' });
    res.json(results);
  });
});
// ✅ Obtener usuarios
// GET http://localhost:3030/usuario/
router.get('/usuarios', (req, res) => {
  const sql = `
  select
    u.id_usuario as id,
    CONCAT(u.nombre,' ',u.apellido ) as nombre,
    u.correo as email,
    u.telefono,
    u.cedula, 
    s.nombre as seguro,
    IF(u.activo = 1, 'Activo', 'Desactivado') as estado,
    s.precio as valorMensual
  from
    usuario u
  left join 
    usuario_seguro us 
  on 
    u.id_usuario =us.id_usuario_per
  left join 	
    seguro s 
  on 
    s.id_seguro =us.id_seguro_per
  where 
    us.id_usuario_seguro 
  and
    u.tipo =1 ; 
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al consultar usuarios' });
    res.json(results);
  });
});

// ✅ Crear nuevo usuario (con encriptación de contraseña)
router.post('/', async (req, res) => {
  const { nombre, apellido, correo, username, password, tipo, cedula, telefono } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = 'INSERT INTO usuario (nombre, apellido, correo, username, password, tipo, activo, cedula, telefono) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)';
    const values = [nombre, apellido, correo, username, hashedPassword, tipo, cedula, telefono];

    db.query(sql, values, (err, result) => {
      if (err) return res.status(500).json({ error: 'Error al registrar usuario' });
      res.status(201).json({ id: result.insertId });
    });
  } catch (err) {
    console.error('Error al encriptar contraseña:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ✅ Editar usuario existente
router.put('/:id', (req, res) => {
  const { nombre, apellido, correo, username, tipo, cedula, telefono } = req.body;
  const sql = 'UPDATE usuario SET nombre=?, apellido=?, correo=?, username=?, tipo=?, cedula=?, telefono=? WHERE id_usuario=?';
  const values = [nombre, apellido, correo, username, tipo, cedula, telefono, req.params.id];

  db.query(sql, values, (err) => {
    if (err) return res.status(500).json({ error: 'Error al actualizar usuario' });
    res.sendStatus(200);
  });
});

// ✅ Desactivar usuario
router.patch('/:id/desactivar', (req, res) => {
  const sql = 'UPDATE usuario SET activo = 0 WHERE id_usuario = ?';
  db.query(sql, [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: 'Error al desactivar usuario' });
    res.sendStatus(200);
  });
});

// Obtener usuarios desactivados
router.get('/inactivos', (req, res) => {
  const sql = 'SELECT id_usuario, nombre, apellido, correo, username, tipo FROM usuario WHERE activo = 0';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al consultar usuarios inactivos' });
    res.json(results);
  });
});


// Activar usuario
router.patch('/:id/activar', (req, res) => {
  const sql = 'UPDATE usuario SET activo = 1 WHERE id_usuario = ?';
  db.query(sql, [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: 'Error al activar usuario' });
    res.sendStatus(200);
  });
});

//numero de clientes
router.get('/conteo/clientes', (req, res) => {
  const sql = 'SELECT COUNT(*) AS total FROM usuario WHERE tipo = 2 AND activo = 1';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al contar clientes' });
    res.json(results[0]);
  });
});

//obtener agentes
router.get('/agentes', (req, res) => {
  const sql = `
  select
    u.id_usuario as id,
    CONCAT(u.nombre, ' ', u.apellido ) as nombre,
    u.correo as email,
    u.telefono,
    u.cedula,
    if(u.activo = 1, 'Activo', 'Desactivado') as estado
  from
    usuario u
  where
    u.tipo = 2 ; 
    `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener el usuario' });
    res.json(results);
  });
});
//obtener usuario por id
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT id_usuario, nombre, apellido, correo, username, tipo, cedula, telefono FROM usuario WHERE id_usuario = ?';

  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener el usuario' });
    if (results.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(results[0]);
  });
});




module.exports = router;

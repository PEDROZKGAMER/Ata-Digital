const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3002;
const JWT_SECRET = 'ata_digital_secret_key';

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Database
const db = new sqlite3.Database('./ata_digital.db');

// Initialize database
db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    profile_photo TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  
  // Add name column if it doesn't exist
  db.run(`ALTER TABLE users ADD COLUMN name TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Erro ao adicionar coluna name:', err);
    }
  });
  
  // Add profile_photo column if it doesn't exist
  db.run(`ALTER TABLE users ADD COLUMN profile_photo TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Erro ao adicionar coluna profile_photo:', err);
    }
  });

  // Classes table
  db.run(`CREATE TABLE IF NOT EXISTS classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    course TEXT NOT NULL,
    date TEXT NOT NULL,
    startTime TEXT NOT NULL,
    duration INTEGER NOT NULL,
    status TEXT DEFAULT 'active',
    user_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Attendance table
  db.run(`CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    class_id INTEGER,
    nome TEXT NOT NULL,
    matricula TEXT NOT NULL,
    curso TEXT NOT NULL,
    periodo TEXT NOT NULL,
    biometria TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes (id)
  )`);
  
  // Add new columns if they don't exist
  db.run(`ALTER TABLE attendance ADD COLUMN curso TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Erro ao adicionar coluna curso:', err);
    }
  });
  
  db.run(`ALTER TABLE attendance ADD COLUMN periodo TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Erro ao adicionar coluna periodo:', err);
    }
  });
});

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token de acesso requerido' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.run(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ message: 'Email já cadastrado' });
          }
          return res.status(500).json({ message: 'Erro interno do servidor' });
        }

        const token = jwt.sign({ id: this.lastID, email }, JWT_SECRET);
        res.json({
          token,
          user: { id: this.lastID, name, email }
        });
      }
    );
  } catch (error) {
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }

    if (!user) {
      return res.status(400).json({ message: 'Credenciais inválidas' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Credenciais inválidas' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, profile_photo: user.profile_photo }
    });
  });
});

// Classes routes
app.post('/api/classes', authenticateToken, (req, res) => {
  const { name, course, date, startTime, duration } = req.body;
  const userId = req.user.id;

  db.run(
    'INSERT INTO classes (name, course, date, startTime, duration, user_id) VALUES (?, ?, ?, ?, ?, ?)',
    [name, course, date, startTime, duration, userId],
    function(err) {
      if (err) {
        return res.status(500).json({ message: 'Erro ao criar aula' });
      }
      res.json({ id: this.lastID, message: 'Aula criada com sucesso' });
    }
  );
});

app.get('/api/classes', authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.all('SELECT * FROM classes WHERE user_id = ? ORDER BY created_at DESC', [userId], (err, classes) => {
    if (err) {
      return res.status(500).json({ message: 'Erro ao buscar aulas' });
    }
    res.json(classes);
  });
});

app.get('/api/classes/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  db.get('SELECT * FROM classes WHERE id = ? AND user_id = ?', [id, userId], (err, classData) => {
    if (err) {
      return res.status(500).json({ message: 'Erro ao buscar aula' });
    }
    if (!classData) {
      return res.status(404).json({ message: 'Aula não encontrada' });
    }
    res.json(classData);
  });
});

app.patch('/api/classes/:id/end', authenticateToken, (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  db.run(
    'UPDATE classes SET status = ? WHERE id = ? AND user_id = ?',
    ['ended', id, userId],
    function(err) {
      if (err) {
        return res.status(500).json({ message: 'Erro ao encerrar aula' });
      }
      res.json({ message: 'Aula encerrada com sucesso' });
    }
  );
});

app.delete('/api/classes/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  // Primeiro deletar as presenças da aula
  db.run('DELETE FROM attendance WHERE class_id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Erro ao deletar presenças da aula' });
    }
    
    // Depois deletar a aula
    db.run(
      'DELETE FROM classes WHERE id = ? AND user_id = ?',
      [id, userId],
      function(err) {
        if (err) {
          return res.status(500).json({ message: 'Erro ao deletar aula' });
        }
        if (this.changes === 0) {
          return res.status(404).json({ message: 'Aula não encontrada' });
        }
        res.json({ message: 'Aula deletada com sucesso' });
      }
    );
  });
});

// Attendance routes
app.post('/api/attendance', (req, res) => {
  const { classId, nome, matricula, curso, periodo, biometria } = req.body;

  db.run(
    'INSERT INTO attendance (class_id, nome, matricula, curso, periodo, biometria) VALUES (?, ?, ?, ?, ?, ?)',
    [classId, nome, matricula, curso, periodo, biometria],
    function(err) {
      if (err) {
        return res.status(500).json({ message: 'Erro ao registrar presença' });
      }
      res.json({ id: this.lastID, message: 'Presença registrada com sucesso' });
    }
  );
});

app.get('/api/attendance/class/:classId', (req, res) => {
  const { classId } = req.params;

  db.all('SELECT * FROM attendance WHERE class_id = ? ORDER BY timestamp', [classId], (err, attendance) => {
    if (err) {
      return res.status(500).json({ message: 'Erro ao buscar presenças' });
    }
    res.json(attendance);
  });
});

app.delete('/api/attendance/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM attendance WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Erro ao deletar presença' });
    }
    res.json({ message: 'Presença deletada com sucesso' });
  });
});

// User routes
app.get('/api/user/profile', authenticateToken, (req, res) => {
  const userId = req.user.id;
  
  db.get('SELECT id, name, email, profile_photo FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Erro ao buscar perfil' });
    }
    res.json(user);
  });
});

app.put('/api/user/profile', authenticateToken, async (req, res) => {
  const { name, email, password, profile_photo } = req.body;
  const userId = req.user.id;

  try {
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      db.run(
        'UPDATE users SET name = ?, email = ?, password = ?, profile_photo = ? WHERE id = ?',
        [name, email, hashedPassword, profile_photo, userId],
        function(err) {
          if (err) {
            return res.status(500).json({ message: 'Erro ao atualizar perfil' });
          }
          res.json({ message: 'Perfil atualizado com sucesso' });
        }
      );
    } else {
      db.run(
        'UPDATE users SET name = ?, email = ?, profile_photo = ? WHERE id = ?',
        [name, email, profile_photo, userId],
        function(err) {
          if (err) {
            return res.status(500).json({ message: 'Erro ao atualizar perfil' });
          }
          res.json({ message: 'Perfil atualizado com sucesso' });
        }
      );
    }
  } catch (error) {
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

app.delete('/api/user/account', authenticateToken, (req, res) => {
  const userId = req.user.id;

  // Deletar presenças das aulas do usuário
  db.run('DELETE FROM attendance WHERE class_id IN (SELECT id FROM classes WHERE user_id = ?)', [userId], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Erro ao deletar presenças' });
    }
    
    // Deletar aulas do usuário
    db.run('DELETE FROM classes WHERE user_id = ?', [userId], function(err) {
      if (err) {
        return res.status(500).json({ message: 'Erro ao deletar aulas' });
      }
      
      // Deletar usuário
      db.run('DELETE FROM users WHERE id = ?', [userId], function(err) {
        if (err) {
          return res.status(500).json({ message: 'Erro ao deletar conta' });
        }
        if (this.changes === 0) {
          return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        res.json({ message: 'Conta deletada com sucesso' });
      });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
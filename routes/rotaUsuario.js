const express = require("express");
const router = express.Router();
const mysql = require("../mysql").pool;
const bcrypt = require('bcrypt'); // Para hash de senha
const jwt = require('jsonwebtoken'); // Para geração de token JWT
mysql.query("CREATE TABLE IF NOT EXISTS usuario (id INTEGER PRIMARY KEY AUTO_INCREMENT, nome TEXT, email TEXT, senha TEXT)", (createTableError) => {
    if (createTableError) {
        console.error(createTableError);
    }

    // O restante do código, se necessário...
});


router.get("/", (req, res, next) => {
    mysql.query("SELECT * FROM usuario", (error, rows) => {
        if (error) {
            return res.status(500).send({
                error: error.message
            });
        }
        res.status(200).send({
            mensagem: "Aqui está a lista de usuários",
            usuarios: rows
        })
    });

});
router.get("/:id", (req, res, next) => {
    const { id } = req.params
    mysql.query("SELECT * FROM usuario WHERE id=?", [id], (error, rows) => {
        if (error) {
            return res.status(500).send({
                error: error.message
            });
        }
        console.log(rows)
        res.status(200).send({
            mensagem: "Aqui está a lista de usuários",
            usuario: rows
        })
    });

});
router.get("/nomes", (req, res, next) => {
    let nomes = [];
    usuario.map((linha) => {
        nomes.push({
            nome: linha.nome,
            email: linha.email
        });
    })
    res.json(nomes);
})
// router.post('/login', (req, res, next) => {
//     const { email, senha } = req.body;

//     mysql.query(`SELECT * FROM usuario WHERE email = ?`, [email], (error, usuario) => {
//         console.log(email)
//         console.log(senha)
//         if (error) {
//             return res.status(500).send({
//                 error: error.message,
//                 response: null
//             });
//         }

//         if (!usuario) {
//             return res.status(401).send({
//                 mensagem: "Usuário não encontrado."
//             });
//         }
        
//         bcrypt.compare(senha, usuario.senha, (bcryptError, result) => {
//             if (bcryptError) {
//                 console.log(bcryptError)
//                 return res.status(500).send({
//                     error: bcryptError.message,
//                     response: null
//                 });
//             }

//             if (!result) {
//                 return res.status(401).send({
//                     mensagem: "Senha incorreta."
//                 });
//             }

//             // Gerar token JWT
//             const token = jwt.sign({ id: usuario.id, email: usuario.email }, 'secreto', { expiresIn: '1h' });

//             res.status(200).send({
//                 mensagem: "Login bem sucedido.",
//                 token: token
//             });
//         });
//     });
// });
router.post('/login', (req, res, next) => {
    const { email, senha } = req.body;

    mysql.getConnection((error, connection) => {
        if (error) {
            console.log(error)
            return res.status(500).send({
                error: error.message
            });
        }

        connection.query("SELECT * FROM usuario WHERE email = ?", [email], (error, results) => {
            connection.release(); // Liberar conexão após consulta

            if (error) {
                console.log(error)
                return res.status(500).send({
                    error: error.message
                });
            }

            if (results.length === 0) {
                return res.status(401).send({
                    mensagem: "Usuário não encontrado."
                });
            }

            const usuario = results[0];

            bcrypt.compare(senha, usuario.senha, (bcryptError, result) => {
                if (bcryptError) {
                    return res.status(500).send({
                        error: bcryptError.message
                    });
                }

                if (!result) {
                    return res.status(401).send({
                        mensagem: "Senha incorreta."
                    });
                }

                res.status(200).send({
                    mensagem: "Login bem sucedido.",
                    usuario: {
                        id: usuario.id,
                        nome: usuario.nome,
                        email: usuario.email
                    }
                });
            });
        });
    });
});
router.post('/', (req, res, next) => {
    const { nome, email, senha } = req.body;

    // Validação dos campos
    let msg = [];
    if (!nome || nome.length < 3) {
        msg.push({ mensagem: "Nome inválido! Deve ter pelo menos 3 caracteres." });
    }
    if (!email || !validateEmail(email)) {
        msg.push({ mensagem: "E-mail inválido!" });
    }
    if (!senha || senha.length < 6) {
        msg.push({ mensagem: "Senha inválida! Deve ter pelo menos 6 caracteres." });
    }
  
    if (msg.length > 0) {
        console.log("Falha ao cadastrar usuário.")
        return res.status(400).send({
            mensagem: "Falha ao cadastrar usuário.",
            erros: msg
        });
    }

    // Verifica se o email já está cadastrado
    mysql.query(`SELECT * FROM usuario WHERE email = ?`, [email], (error, usuarioExistente) => {
        if (error) {
            return res.status(500).send({
                error: error.message,
                response: null
            });
        }
        
        if (usuarioExistente.length>0) {
            console.log("E-mail já cadastrado.")
            return res.status(400).send({
                mensagem: "E-mail já cadastrado."
            });
        }

        // Hash da senha antes de salvar no banco de dados
        bcrypt.hash(senha, 10, (hashError, hashedPassword) => {
            if (hashError) {
                return res.status(500).send({
                    error: hashError.message,
                    response: null
                });
            }

            // Insere o novo usuário no banco de dados
            mysql.query(`INSERT INTO usuario (nome, email, senha) VALUES (?, ?, ?)`, [nome, email, hashedPassword], function (insertError) {
                if (insertError) {
                    return res.status(500).send({
                        error: insertError.message,
                        response: null
                    });
                }
                res.status(201).send({
                    mensagem: "Cadastro criado com sucesso!",
                    usuario: {
                        id: this.lastID,
                        nome: nome,
                        email: email
                    }
                });
            });
        });
    });
});

// Função para validar formato de e-mail
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}


router.put("/", (req, res, next) => {
    const { id, nome, email, senha } = req.body;

    // Validação dos campos
    let msg = [];
    if (!nome || nome.length < 3) {
        msg.push({ mensagem: "Nome inválido! Deve ter pelo menos 3 caracteres." });
    }
    if (!email || !validateEmail(email)) {
        msg.push({ mensagem: "E-mail inválido!" });
    }
    if (!senha) {
        msg.push({ mensagem: "Senha inválida! Deve ser informada." });
    } else if (senha.length < 6) {
        msg.push({ mensagem: "A senha deve conter pelo menos 6 caracteres." });
    }
    if (msg.length > 0) {
        console.log("Falha ao atualizar usuário.")
        return res.status(400).send({
            mensagem: "Falha ao atualizar usuário.",
            erros: msg
        });
    }

    // Hash da nova senha antes de atualizar no banco de dados
    bcrypt.hash(senha, 10, (hashError, hashedPassword) => {
        if (hashError) {
            return res.status(500).send({
                error: hashError.message,
                response: null
            });
        }

        // Atualiza os dados do usuário no banco de dados
        mysql.query("UPDATE usuario SET nome=?, email=?, senha=? WHERE id=?",
            [nome, email, hashedPassword, id],
            function (updateError) {
                if (updateError) {
                    return res.status(500).send({
                        error: updateError.message,
                        response: null
                    });
                }
                res.status(200).send({
                    mensagem: "Cadastro alterado com sucesso!!"
                });
            }
        );
    });
});






router.delete("/:id", (req, res, next) => {
    const { id } = req.params

    mysql.query("DELETE FROM usuario WHERE id= ?", id, (error) => {
        if (error) {
            return res.status(500).send({
                error: error.message
            });
        }
        res.status(200).send({
            mensagem: "Cadastro deletado com sucesso!!"
        })
    })

})

module.exports = router;
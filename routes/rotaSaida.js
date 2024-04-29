const express = require("express");
const router = express.Router();
const mysql = require("../mysql").pool;
const bcrypt = require('bcrypt'); // Para hash de senha
const jwt = require('jsonwebtoken'); // Para geração de token JWT


mysql.query("CREATE TABLE IF NOT EXISTS saida (id INTEGER PRIMARY KEY AUTO_INCREMENT, id_produto INTEGER, qtde REAL, data_saida TEXT, valor_unitario REAL)", (createTableError) => {
    if (createTableError) {
        console.error(createTableError);
    }

    // O restante do código, se necessário...
});


router.get("/",(req,res,next)=>{
    console.log("erro linha 39")
    mysql.query(`SELECT 
    saida.id as id,
    saida.qtde as qtde,
    saida.data_saida as data_saida,
    produto.id as id_produto,
    produto.descricao as descricao
    
    FROM saida 
    
    INNER JOIN produto 
    ON saida.id_produto = produto.id`,(error,rows)=>{
        
        if(error){
            console.log(error)
            return res.status(500).send({
                error:error.message
            });
        }
        res.status(200).send({
            mensagem:"Aqui está a lista de saida de produtos",
            saida:rows
        })
    });
    
});
router.get("/:id",(req,res,next)=>{
    console.log("erro linha 56")
    const {id} = req.params
    mysql.query("SELECT * FROM saida WHERE id=?",[id],(error,rows)=>{
        if(error){
            return res.status(500).send({
                error:error.message
            });
        }
        console.log(rows)
        res.status(200).send({
            mensagem:"Aqui está a saida solicitada",
            saida:rows
        })
    });
    });
    



    function atualizarestoque(id_produto, qtde, valor_unitario) {
        mysql.query('CALL atualizar_estoque(?, ?, ?)', [id_produto, qtde, valor_unitario], (error, result) => {
            if (error) {
                console.error("Erro ao atualizar o estoque:", error);
                return;
            }
            console.log("Estoque atualizado com sucesso!");
        });
    }
    
    router.post('/', (req, res, next) => {
        mysql.query("CREATE TABLE IF NOT EXISTS saida (id INTEGER PRIMARY KEY AUTO_INCREMENT, id_produto INTEGER, qtde REAL, data_saida TEXT, valor_unitario REAL)", (createTableError) => {
            if (createTableError) {
                return res.status(500).send({
                    error: createTableError.message
                });
            }
        });
    
        const { id_produto, qtde, data_saida, valor_unitario } = req.body;
    
        // Validação dos dados de entrada
        let msg = [];
        if (!id_produto) {
            msg.push({ mensagem: "ID do produto inválido! Não pode ser vazio." });
        }
        if (!qtde || qtde <= 0) {
            msg.push({ mensagem: "Quantidade inválida! Deve ser maior que zero." });
        }
    
        if (msg.length > 0) {
            console.log("Falha ao cadastrar saída.");
            return res.status(400).send({
                mensagem: "Falha ao cadastrar saída.",
                erros: msg
            });
        }
    
        // Insere a nova saída no banco de dados
        mysql.query(`INSERT INTO saida (id_produto, qtde, data_saida, valor_unitario) VALUES (?, ?, ?, ?)`, [id_produto, qtde, data_saida, valor_unitario], function (insertError, result) {
            if (insertError) {
                console.error("Erro ao inserir nova saída:", insertError);
                return res.status(500).send({
                    error: insertError.message,
                    response: null
                });
            }
    
            // Atualiza o estoque após a inserção da saída
            atualizarestoque(id_produto, -qtde, valor_unitario); // Subtrai a quantidade vendida do estoque
    
            // Retorna uma resposta de sucesso
            res.status(201).send({
                mensagem: "Saída cadastrada com sucesso!",
                saida: {
                    id: result.insertId,
                    id_produto: id_produto,
                    qtde: qtde,
                    data_saida: data_saida,
                    valor_unitario: valor_unitario
                }
            });
        });
    });
    


module.exports = router;
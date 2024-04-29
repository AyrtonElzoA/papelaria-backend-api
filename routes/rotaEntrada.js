const express = require("express");
const router = express.Router();
const mysql = require("../mysql").pool;
const bcrypt = require('bcrypt'); // Para hash de senha
const jwt = require('jsonwebtoken'); // Para geração de token JWT
const { res } = require("express");


mysql.query("CREATE TABLE IF NOT EXISTS entrada (id INT PRIMARY KEY AUTO_INCREMENT, id_produto INT, qtde REAL, data_entrada TEXT, valor_unitario REAL)", (createTableError) => {
    if (createTableError) {
        console.error(createTableError);
    }

    // O restante do código, se necessário...
});


router.get("/",(req,res,next)=>{
    console.log("erro linha 39")
    mysql.query(`SELECT 
    entrada.id as id,
    entrada.qtde as qtde,
    entrada.data_entrada as data_entrada,
    produto.id as id_produto,
    produto.descricao as descricao
    
    FROM entrada 
    
    INNER JOIN produto 
    ON entrada.id_produto = produto.id`,(error,rows)=>{
        
        if(error){
            console.log(error)
            return res.status(500).send({
                error:error.message
            });
        }
        res.status(200).send({
            mensagem:"Aqui está a lista de entradas de produtos",
            entrada:rows
        })
    });
    
});
router.get("/:id",(req,res,next)=>{
    console.log("erro linha 56")
    const {id} = req.params
    mysql.query("SELECT * FROM entrada WHERE id=?",[id],(error,rows)=>{
        if(error){
            return res.status(500).send({
                error:error.message
            });
        }
        console.log(rows)
        res.status(200).send({
            mensagem:"Aqui está a entrada solicitada",
            entrada:rows
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
        mysql.query("CREATE TABLE IF NOT EXISTS entrada (id INT PRIMARY KEY AUTO_INCREMENT, id_produto INT, qtde REAL, data_entrada TEXT, valor_unitario REAL)", (createTableError) => {
            if (createTableError) {
                return res.status(500).send({
                    error: createTableError.message
                });
            }
        });
    
        const { id_produto, qtde, data_entrada, valor_unitario } = req.body;
    
        // Validação dos dados de entrada
        let msg = [];
        if (!id_produto) {
            msg.push({ mensagem: "ID do produto inválido! Não pode ser vazio." });
        }
        if (!qtde || qtde <= 0) {
            msg.push({ mensagem: "Quantidade inválida! Deve ser maior que zero." });
        }
        // Outras validações podem ser adicionadas aqui...
    
        if (msg.length > 0) {
            console.log("Falha ao cadastrar entrada.");
            return res.status(400).send({
                mensagem: "Falha ao cadastrar entrada.",
                erros: msg
            });
        }
    
        // Insere a nova entrada no banco de dados
        mysql.query(`INSERT INTO entrada (id_produto, qtde, data_entrada, valor_unitario) VALUES (?, ?, ?, ?)`, [id_produto, qtde, data_entrada, valor_unitario], function (insertError, result) {
            if (insertError) {
                console.error("Erro ao inserir nova entrada:", insertError);
                return res.status(500).send({
                    error: insertError.message,
                    response: null
                });
            }
    
            // Atualiza o estoque após a inserção da entrada
            atualizarestoque(id_produto, qtde, valor_unitario);
    
            // Retorna uma resposta de sucesso
            res.status(201).send({
                mensagem: "Entrada cadastrada com sucesso!",
                entrada: {
                    id: result.insertId,
                    id_produto: id_produto,
                    qtde: qtde,
                    data_entrada: data_entrada,
                    valor_unitario: valor_unitario
                }
            });
        });
    });
    
router.put("/",(req,res,next)=>{
    const {id,id_produto, qtde, data_entrada, valor_unitario } = req.body;
    mysql.query("UPDATE produto SET id_produto=?,qtde=?,data_entrada=?,valor_unitario=? WHERE id=?",
    [id_produto, qtde, data_entrada, valor_unitario, id ],function(error){
        if(error){
            return res.status(500).send({
                error:error.message
            });
        }
        res.status(200).send({
            mensagem:"Produto alterado com sucesso!!",
            
        })
    });                                                      
   
})
router.delete("/:id",(req,res,next)=>{
    const {id} = req.params
   
    mysql.query("DELETE FROM entrada WHERE id= ?",id,(error)=>{
        if(error){
            return res.status(500).send({
                error:error.message
            });
        }
        res.status(200).send({
            mensagem:"Entrada deletada com sucesso!!"
        })
    })
    
})

module.exports = router;
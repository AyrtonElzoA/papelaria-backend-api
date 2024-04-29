const express = require("express");
const router = express.Router();
const mysql = require("../mysql").pool;



// Criação da tabela de estoque no banco de dados, caso não exista
mysql.query("CREATE TABLE IF NOT EXISTS estoque (id INTEGER PRIMARY KEY AUTO_INCREMENT, id_produto INTEGER, quantidade REAL, valor_unitario REAL)", (createTableError) => {
    if (createTableError) {
        console.error(createTableError);
    }
});


router.get("/",(req,res,next)=>{
    console.log("erro linha 39")
    mysql.query(`SELECT 
    estoque.id as id, 
    estoque.quantidade as quantidade,
    estoque.valor_unitario as valor_unitario,
    produto.descricao as descricao,
    produto.id as id_produto
    FROM estoque 
    INNER JOIN produto 
    ON estoque.id_produto = produto.id`,(error,rows)=>{
        
        if(error){
            console.log(error)
            return res.status(500).send({
                error:error.message
            });
        }
        res.status(200).send({
            mensagem:"Aqui está a lista do estoque",
            estoque:rows
        })
    });
    
});
router.get("/:id",(req,res,next)=>{
    console.log("erro linha 56")
    const {id} = req.params
    mysql.query("SELECT * FROM estoque WHERE id_produto=?",[id],(error,rows)=>{
        if(error){
            return res.status(500).send({
                error:error.message
            });
        }
        console.log(rows)
        res.status(200).send({
            mensagem:"Aqui está a lista do estoque ",
            estoque:rows
        })
    });
    
});


module.exports = router;
const models = require('../../models');
const paginate = require('express-paginate');

exports.get_products = async (req,res) => {

    try{

        const [ products, totalCount ] = await Promise.all([

            models.Products.findAll({
                include : [
                    {
                        model : models.User ,
                        as : 'Owner',
                        attributes : [ 'username' , 'displayname' ]
                    },
                ],
                limit : req.query.limit ,
                offset : req.offset
            }),

            models.Products.count()
        ]);

        const pageCount = Math.ceil( totalCount / req.query.limit );
    
        const pages = paginate.getArrayPages(req)( 4 , pageCount, req.query.page);

        res.render( 'admin/products.html' , { products , pages , pageCount });

    }catch(e){
        console.log(e);
    }

}

exports.get_write = ( req , res ) => {
    res.render( 'admin/form.html' , { csrfToken : req.csrfToken() });
}

exports.post_write = async (req,res) => {

    try{
        req.body.thumbnail = (req.file) ? req.file.filename : "";
        // 유저를 가져온다음에 저장
        const user = await models.User.findByPk(req.user.id);
        await user.createProduct(req.body)
        res.redirect('/admin/products');

    }catch(e){
        console.log(e);
    }
};

exports.get_detail = async(req, res) => {

    try{

        const product = await models.Products.findOne({
            where : {
                id : req.params.id
            },
            include :[
                'Memo'
            ]
        });

        res.render('admin/detail.html', { product });  

    }catch(e){
        console.log(e)
    }

    
}

exports.post_detail = async(req, res) => {

    try{

        const product = await models.Products.findByPk(req.params.id);
        // create + as에 적은 내용 ( Products.js association 에서 적은 내용 )
        await product.createMemo(req.body)
        res.redirect('/admin/products/detail/'+req.params.id);  

    }catch(e){
        console.log(e)
    }

    
}

exports.get_edit = async(req, res) => {

    try{

        const product = await models.Products.findOne({
            where : { id : req.params.id},
            include : [ 
                { model : models.Tag, as : 'Tag' }
            ],
            order: [
                [ 'Tag', 'createdAt', 'desc' ]
            ]
        });
        
        res.render('admin/form.html', { product , csrfToken : req.csrfToken() });  

    }catch(e){

    }

    
}

exports.post_edit = async(req, res) => {

    try{
        // 이전에 저장되어있는 파일명을 받아오기 위함
        const product = await models.Products.findByPk(req.params.id);

        if(req.file && product.thumbnail){  //요청중에 파일이 존재 할시 이전이미지 지운다.
            fs.unlinkSync( uploadDir + '/' + product.thumbnail );
        }

        // 파일요청이면 파일명을 담고 아니면 이전 DB에서 가져온다
        req.body.thumbnail = (req.file) ? req.file.filename : product.thumbnail;

        await models.Products.update(
            req.body , 
            { 
                where : { id: req.params.id } 
            }
        );
        res.redirect('/admin/products/detail/' + req.params.id );

    }catch(e){

    }

}

exports.get_delete = async(req, res) => {

    try{

        await models.Products.destroy({
            where: {
                id: req.params.id
            }
        });
        res.redirect('/admin/products');

    }catch(e){

    }

}

exports.delete_memo = async(req, res) => {

    try{

        await models.ProductsMemo.destroy({
            where: {
                id: req.params.memo_id
            }
        });
        res.redirect('/admin/products/detail/' + req.params.product_id );

    }catch(e){

    }

}

exports.ajax_summernote = (req,res) => {
    res.send( '/uploads/' + req.file.filename);
}

exports.get_order = async(req,res) => {

    try{

        const checkouts = await models.Checkout.findAll();
        res.render( 'admin/order.html' , { checkouts });

    }catch(e){

    }
}

exports.get_order_edit = async(req,res) => {
    try{

        const checkout = await models.Checkout.findByPk(req.params.id);
        res.render( 'admin/order_edit.html' , { checkout });

    }catch(e){

    }
}

exports.statistics = async( _ ,res) => {
    try{
        const barData = await models.Checkout.findAll({
            attributes: [
                [models.sequelize.literal('date_format( createdAt, "%Y-%m-%d")'), 'date'],
                [models.sequelize.fn('count', models.sequelize.col('id')), 'cnt']
            ],
            group: [ 'date' ]
        });

        const pieData = await models.Checkout.findAll({
            attributes: [
                'status' ,
                [models.sequelize.fn('count', models.sequelize.col('id')), 'cnt']
            ],
            group: [ 'status' ]
        })         
    
        res.render('admin/statistics.html' , { barData , pieData });

    }catch(e){
        console.log(e)
    }

}


exports.post_order_edit = async(req,res) => {
    try{

        await models.Checkout.update(
            req.body , 
            { 
                where : { id: req.params.id } 
            }
        );

        res.redirect('/admin/order');

    }catch(e){

    }
}

exports.write_tag = async (req, res) => {
    try {
        const tag = await models.Tag.findOrCreate({
            where: {
                name : req.body.name
            }
        });


        const product = await models.Products.findByPk(req.body.product_id);
        const status = await product.addTag(tag[0]);

        res.json({
            status : status,
            tag : tag[0]
        })

    } catch (e) {
        res.json(e)
    }
}

exports.delete_tag = async (req, res) => {
    try {
        const product = await models.Products.findByPk(req.params.product_id);
        const tag = await models.Tag.findByPk(req.params.tag_id);

        const result = await product.removeTag(tag);
        
        res.json({
            result : result
        });
    } catch (e) {

    }
}
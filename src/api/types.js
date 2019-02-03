'use strict'
const status = require('http-status')
const router = require('express').Router();
const path = require('path')


module.exports = (options) => {
    const {repo,storageService, storagePath} = options
    

    router.get('/', async (req,res) => {
        var productTypes = await repo.getProductTypes();
        res.status(status.OK).json(productTypes)
    })

    router.post('/', async (req,res) => {
        const productTypeData = {
            name: req.body.name,
            image: req.body.image,
            category: req.body.category,
            steps: req.body.steps,
        }

        try{
            var productType = await repo.createProductType(productTypeData)

            productTypeData._id = productType._id
            if(req.files.image){
                var image = req.files.image
    
                var filename = Date.now()+ '-' + image.originalFilename
                var pathname = path.join(req.originalUrl, productType._id.toString())
                var completePath = path.join(storagePath,pathname)
                var uploadfile = await storageService.saveToDir(image.path, filename, completePath )
                productType.image = filename
                productType.save()

            }

            productType ?
                res.status(status.OK).json(productType)
            :
                res.status(404).send()
        } catch (err) {
            res.status(400).send({'msg': err.message})
        }
    })

    router.put('/:productTypeID', async (req,res) => {
        const productTypeData = {
            name: req.body.name,
            image: req.body.image,
            category: req.body.category,
            steps: req.body.steps,
        }

        try{
            if(req.files.image){
                
                var pathname = req.originalUrl
                var completePathname = path.join(storagePath, pathname)
                var productType = await repo.getProductType(req.params.productTypeID)
                if(productType.image){
                    var filename = path.join(pathname,productType.image)
                    var deleteFile = await storageService.deleteFile(filename,storagePath)            
                }

                var image = req.files.image    
                var filename = Date.now()+ '-' + image.originalFilename
                
                var uploadfile = await storageService.saveToDir(image.path, filename, completePathname )
                productTypeData.image = filename

                

            }else{
                productTypeData.image=req.body.image
            }

            var productType = await repo.updateProductType(req.params.productTypeID,productTypeData)
            productType ?
                res.status(status.OK).json(productType)
            :
                res.status(404).send()
        } catch (err) {
            res.status(400).send({'msg': err.message})
        }
    })
    router.delete('/:productTypeID', async (req,res) => {
        try{
            var productType = await repo.deleteProductType(req.params.productTypeID)
            productType ?
                res.status(status.OK).json(productType)             
            :
                res.status(404).send()
        } catch (err) {
            res.status(400).send({'msg': err.message})
        }
    })

   
    return router;
}
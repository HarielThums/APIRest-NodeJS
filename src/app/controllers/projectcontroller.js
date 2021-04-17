const express = require('express')
const authMiddleware = require('../middlewares/auth')

const Project = require('../models/project')
const Task = require('../models/task')

const router = express.Router()

// aplicando o middleware ao router
router.use(authMiddleware)

// Find All
router.get('/', async (req,res) => {
    try {
        const projects = await Project.find().populate(['user', 'tasks']) // buscando todos os projetos e serando eles por usuario que cadastrou.

        return res.send({ projects })
    } catch (error) {
        return res.status(400).send({ error: 'Error loading projects'})
    }
})

// find One
router.get('/:projectId', async (req,res) => {
    try {
        const project = await Project.findById( req.params.projectId ).populate(['user', 'tasks']) // buscando todos os projetos e serando eles por usuario que cadastrou.

        return res.send({ project })
    } catch (error) {
        return res.status(400).send({ error: 'Error loading project'})
    }
})

// Create
router.post('/', async (req,res) => {
    try {
        const { title, description, tasks } = req.body
        
        const project = await Project.create({ title, description, user: req.userId }) // necessario referenciar o usuario para aparecer quem criou o projeto.
        
        await Promise.all(tasks.map(async task => {
            const projectTask = new Task({ ...task, project: project._id })

            await projectTask.save()
            
            project.tasks.push(projectTask)
        }))

        await project.save()


        return res.send({ project })
    } catch (error) {
        return res.status(400).send({ error: 'Error creating new project'})
    }
})

// Udate
router.put('/:projectId', async (req,res) => {
    try {
        const { title, description, tasks } = req.body
        
        const project = await Project.findByIdAndUpdate(req.params.projectId, { title, description}, { new: true }) // new true é necessario para que ele já retorne o projeto atualizado 

        project.tasks = []
        await Task.remove({ project: project._id }) // limpando todas as tasks antes de enviar as atualizadas
        
        await Promise.all(tasks.map(async task => {
            const projectTask = new Task({ ...task, project: project._id })

            await projectTask.save()
            
            project.tasks.push(projectTask)
        }))

        await project.save()


        return res.send({ project })
    } catch (error) {
        return res.status(400).send({ error: 'Error updating project'})
    }
})

// Remove
router.delete('/:projectId', async (req,res) => {
    try {
        await Project.findByIdAndDelete( req.params.projectId ).populate('user') // buscando todos os projetos e serando eles por usuario que cadastrou.

        return res.send()
    } catch (error) {
        return res.status(400).send({ error: 'Error deleting project'})
    }
})

module.exports = app => app.use('/projects', router)
var ordenDAO = require('../dao/OrdenDAO');
var citaDAO = require('../dao/citaDAO');
var HttpStatus = require('http-status-codes');
var moment = require('moment');


const createOrden = (req, res, next) => {
    try {
        var orden = req.body;
        console.debug('Parametro de orden recibido :::::>', orden);

        if(orden.IdCita){
            citaDAO.getById(orden.IdCita, (error, cita) => {
                if (error) {
                    console.error('Error al realizar la transaccion de crear orden:::>', 'error ::>', error);
                    if (error.errors) {
                        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.errors[0] });
                    } else {
                        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
                    }
                } else {
                    if (cita) {
                        let CodigoOrden = orden.CodigoOrden ?  orden.CodigoOrden : moment().format("MMDDYYYYHHMM")+cita.vehiculo.placa
                        let ordenDB = {            //IdVehiculo: vehiculo.IdVehiculo,
                            IdTaller: orden.IdTaller,
                            IdEtapa: orden.IdEtapa,
                            IdCita: orden.IdCita,
                            IdMecanico: orden.mecanico,
                            IdVehiculo: cita.IdVehiculo,
                            kilometraje: orden.kilometraje,
                            DocumentosDeja: orden.documentos,
                            CodigoOrden: CodigoOrden,
                            Observaciones: orden.Observaciones
                        }
    
                        ordenDAO.create(ordenDB, (error, orden) => {
                            if (error) {
                                console.error('Error al realizar la transaccion de crear orden de trabajo:::>', 'error ::>', error);
                                if (error.errors) {
                                    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.errors[0] });
                                } else {
                                    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
                                }
                            } else {
                                if (orden) {
                                    if(orden.IdEtapa){
                                        cita.estado = 'Con orden'
                                        citaDAO.update(cita.IdCita,cita,(error,cita)=>{
                                            if (error) {
                                                console.error('Error al realizar la transaccion de crear actualizar cita:::>', 'error ::>', error);
                                                if (error.errors) {
                                                    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.errors[0] });
                                                } else {
                                                    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
                                                }
                                            } else {
                                                if (cita) {
                                                    return res.status(HttpStatus.OK).json({ message: "Se creo la orden de trabajo"});                                
                                                }
                                            }
                                        })
                                    }else{
                                        return res.status(HttpStatus.OK).json({ message: "Se creo la orden de trabajo"});                                
                                    }
                                    
                                    
                                } else {
                                    return res.status(HttpStatus.OK).json({ error: "No se creo la cita" });
                                }
                            }
                        });                    
                    }
                }
            });
        }else{
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'El valor IdCita es requerido' });    
        }

        
    } catch (error) {
        console.error('Error al crear orden ', error);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
}

const getAllEtapas = (req, res, next) => {
    try {
        ordenDAO.findAllEtapas(function (error, etapas) {
            if (error) {
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ error: error.errors[0] });
            } else {
                if (etapas) {
                    res.status(HttpStatus.OK).json(etapas);
                }
            }
        });
    } catch (error) {
        console.error('Error al obtener etapas ::::::>', error);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
}

const getAllOrdenesByIdTaller = (req, res, next) =>{
    try {
        var IdTaller = req.params.Id;

        ordenDAO.findAllByFilter({ IdTaller: IdTaller }, {}, function (error, ordenes) {
            if (error) {
                console.error('Error al realizar la transaccion de buscar citas:::>', 'error ::>', error.message);
                if (error.errors) {
                    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.errors[0] });
                } else {
                    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
                }
            } else {
                if (ordenes) {
                    res.status(HttpStatus.OK).json(ordenes);
                }
            }
        });
    } catch (error) {
        console.error('Error al listar ordenes ::::> ', error);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
}


module.exports = {
    createOrden,
    getAllEtapas,
    getAllOrdenesByIdTaller
}
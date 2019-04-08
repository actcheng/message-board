/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;

const nThreads = 10;
const nReplies = 3;

module.exports = function (app) {

  app.route('/api/threads/:board')
    .get((req,res)=>{
      let currentBoard = req.params.board

      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        if (err) throw err
        console.log('Connected')
        db.collection(currentBoard).find()
          .sort({bumped_on:-1})
          .limit(nThreads)
          .toArray(
          (err,doc)=>{
            if (err) throw err
            let response = doc.map(x => {
              let replies = x.replies.filter((r,i)=> i>x.replies.length-(nReplies+1)).map(r=>{
                return {
                  _id: r._id,
                  text: r.text,
                  created_on: r.created_on
                }
              })
              return {
                _id: x._id,
                text: x.text,
                created_on: x.created_on,
                bumped_on: x.bumped_on,
                replies: replies,
                replyCount: replies.length
              }
            })
            res.send(response)
        })
      });
    })
    .post((req,res)=>{
      let currentBoard = req.params.board
      let now = new Date();
      let newThread = {
        text: req.body.text,
        created_on: now,
        bumped_on: now,
        reported: false,
        delete_password: req.body.delete_password,
        replies: []
      }
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        if (err) throw err
        console.log('Connected')
        db.collection(currentBoard)
          .insertOne(newThread,(err,doc)=>{
            if (err) throw err
            res.redirect('/b/'+currentBoard)
          })
      });

    })
    .put((req,res)=>{
      let currentBoard = req.params.board
      let id = req.body.thread_id

      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        if (err) throw err
        console.log('Connected')
        db.collection(currentBoard).findAndModify(
          {_id:ObjectId(id)},
          {},
          {$set: {reported: true}},
          (err,doc)=>{
            if (err) throw err
            console.log(doc)
            res.send('success')
          });
      });
    })
    .delete((req,res)=>{
      let currentBoard = req.params.board
      let id = req.body.thread_id
      let input_password = req.body.delete_password
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        if (err) throw err
        console.log('Connected')
        db.collection(currentBoard).find({_id:ObjectId(id)})
          .toArray((err,result)=>{
           if (result.length < 0){
             res.send('Invalid id')
            } else {
              console.log(result[0])
              if (input_password == result[0].delete_password){
                db.collection(currentBoard).remove({_id:ObjectId(id)},
                  (err,doc) => {
                  if (err) throw err
                  res.send('success')
              });
            } else {
              res.send('incorrect password')
            }
          }
        });
      });
    });

  app.route('/api/replies/:board')
    .get((req,res)=>{
      let currentBoard = req.params.board
      let thread_id = req.query.thread_id

      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        if (err) throw err
        console.log('Connected')
        db.collection(currentBoard).find({_id:ObjectId(thread_id)})
          .toArray(
          (err,doc)=>{
            if (err) throw err
            let response = doc.map(x => {
              return {
                _id: x._id,
                text: x.text,
                created_on: x.created_on,
                bumped_on: x.bumped_on,
                replies: x.replies.map(r=>{
                  return {
                    _id: r._id,
                    text: r.text,
                    created_on: r.created_on
                  }
                })
              }
            })
            res.json(response[0])
        })
      });
    })
    .post((req,res)=>{
      let currentBoard = req.params.board
      let now = new Date();
      let id = req.body.thread_id
      let newReply = {
        _id: ObjectId(),
        text: req.body.text,
        created_on: now,
        delete_password: req.body.delete_password,
        reported: false
      }
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        if (err) throw err
        console.log('Connected')
        db.collection(currentBoard).findAndModify(
          {_id:ObjectId(id)},
          {},
          { $push:{replies: newReply},
            $set: {bumped_on: now}
        },
          (err,doc)=>{
            if (err) throw err
            res.redirect('/b/'+currentBoard)
          });
      });
    })
    .put((req,res)=>{
      let currentBoard = req.params.board
      let thread_id = req.body.thread_id
      let reply_id = req.body.reply_id

      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        if (err) throw err
        console.log('Connected')
        db.collection(currentBoard).findAndModify(
          {_id:ObjectId(thread_id),
            "replies":{$elemMatch:{_id:ObjectId(reply_id)}}},
          {},
          {$set: {"replies.$.reported": true}},
          (err,doc)=>{
            if (err) throw err
            res.send('success')
          });
      });
    })
    .delete((req,res)=>{
      let currentBoard = req.params.board
      let input_password = req.body.delete_password
      let thread_id = req.body.thread_id
      let reply_id = req.body.reply_id
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        if (err) throw err
        console.log('Connected')
        db.collection(currentBoard)
          .find({_id:ObjectId(thread_id),
            "replies":{$elemMatch:{_id:ObjectId(reply_id)}}})
          .toArray((err,result)=>{
           if (result.length < 0){
             res.send('Invalid id')
            } else {
              let delete_password = result[0].replies.filter((x=>x._id==reply_id))[0].delete_password
              if (input_password == delete_password){
                db.collection('test').findAndModify(
                  {_id:ObjectId(thread_id)},
                  {},
                  {$pull: {                  "replies":{_id:ObjectId(reply_id)}}},
                  (err,doc)=>{
                    if (err) throw err
                    res.send('success')
                  });
              } else {
                res.send('incorrect password')
              }
          }
        });
      });
    });

};

/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  suite('API ROUTING FOR /api/threads/:board', function() {

    test('POST', function(done) {
      chai.request(server)
          .post('/api/threads/test')
          .send({text:'Chai test',delete_password:'chai'})
          .end(function(err,res){
            assert.equal(res.status,200);
            done();
          })
    });

    test('GET', function(done) {
      chai.request(server)
          .get('/api/threads/test')
          .end(function(err,res){
            assert.equal(res.status,200);
            assert.isArray(res.body);
            assert.isAtMost(res.body.length,10);
            assert.property(res.body[0],'_id');
            assert.property(res.body[0],'text');
            assert.property(res.body[0],'created_on');
            assert.property(res.body[0],'bumped_on');
            assert.property(res.body[0],'replies');
            assert.isAtMost(res.body[0].replies,3);
            done();
          })
    });

    test('PUT', function(done) {
      chai.request(server)
          .put('/api/threads/test')
          .send({thread_id:'5cab461332278b2da8681bff'})
          .end(function(err,res){
            assert.equal(res.status,200);
            console.log(res.text)
            assert.equal(res.text,'success')
            done();
          });
    });

    test('DELETE', function(done) {
      chai.request(server)
          .delete('/api/threads/test')
          .send({thread_id:'5cab497467349125b475d979',delete_password:'chai'})
          .end(function(err,res){
            assert.equal(res.status,200);
            console.log(res.body)
            assert.equal(res.text,'success')
            done();
          })
    });
  });

  suite('API ROUTING FOR /api/replies/:board', function() {

    test('POST', function(done) {
      chai.request(server)
          .post('/api/replies/test')
          .send({thread_id:'5cab461332278b2da8681bff',text:'Chai test',delete_password:'chai'})
          .end(function(err,res){
            assert.equal(res.status,200);
            done();
          })
    });

    test('GET', function(done) {
      chai.request(server)
          .get('/api/replies/test?thread_id=5cab461332278b2da8681bff')
          .end(function(err,res){
            assert.equal(res.status,200);
            assert.property(res.body,'_id');
            assert.property(res.body,'text');
            assert.property(res.body,'created_on');
            assert.property(res.body,'bumped_on');
            assert.property(res.body,'replies');
            assert.isArray(res.body.replies);
            done();
          });
    });

    test('PUT', function(done) {
      chai.request(server)
          .put('/api/replies/test')
          .send({thread_id:'5ca9e7a70560730be834eebf',reply_id: '5ca9ee306742be2884dfcf78'})
          .end(function(err,res){
            assert.equal(res.status,200);
            assert.equal(res.text,'success')
            done();
          })
    });

    test('DELETE', function(done) {
      chai.request(server)
          .put('/api/replies/test')
          .send({thread_id:'5cab461332278b2da8681bff',reply_id: '5cab48902d82e20264ced61d',delete_password:'test'})
          .end(function(err,res){
            assert.equal(res.status,200);
            console.log(res.body)
            assert.equal(res.text,'success')
            done();
          });
    });

  });

});

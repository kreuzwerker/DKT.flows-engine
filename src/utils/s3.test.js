import S3 from './s3'


describe('S3 Util', function () {
  it('has a bucket defined', function () {
    expect(S3).to.have.ownProperty('bucket')
    expect(S3.bucket).is.a('string')
  })

  it('has a getObject function', function () {
    expect(S3).to.have.ownProperty('getObject')
  })


  it('has a putObject function', function () {
    expect(S3).to.have.ownProperty('putObject')
  })
})

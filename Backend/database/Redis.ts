import * as redis from 'redis';
import * as bluebird from 'bluebird';
import * as protobuf from 'protobufjs';

bluebird.promisifyAll((redis as any).RedisClient.prototype);
bluebird.promisifyAll((redis as any).Multi.prototype);

const root = new protobuf.Root();

export const redisClient: any = redis.createClient({
    host: 'redis',
    port: 6379,
    return_buffers: true
});

export const ImagesArrayProtoBuffer: TProtoBuffer =  ({argument, encode, decode}) => {

    return  root.load('./GraphQL/Images.proto', {keepCase: true})
        .then(ProtoFile => {

             return encode ? encodeProtoBuf(ProtoFile, argument) : decode
                 ? decodeProtoBuf(ProtoFile, argument) : new Error('Missing instruction');

        });

};

const decodeProtoBuf = (ProtoFile, encodedBuffer) => {
    const ImageArray = ProtoFile.lookupType('ImageDefinition.ImageList');
    const decode = ImageArray.decode(encodedBuffer);
    return decode.toObject({arrays: true});
};

const encodeProtoBuf = (ProtoFile, payload) => {
    const ImageArray = ProtoFile.lookupType('ImageDefinition.ImageList');
    const errMsg = ImageArray.verify(payload);
    if (errMsg) { throw errMsg; }
    const message = ImageArray.create(payload);
    return ImageArray.encode(message).finish();
};
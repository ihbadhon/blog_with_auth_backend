import { HttpException, Injectable } from '@nestjs/common';
import { AuthPayloadDto } from './dot/auth.dto';
import { JwtService } from '@nestjs/jwt';


const fakeUsers = [
   { 
    id:1,
    username: 'john',
    password: 'changeme',
},
   { 
    id:2,
    username: 'maria',
    password: 'guess',
}
]


@Injectable()
export class AuthService {
    constructor(private jwtService: JwtService) {};

    validateUser({username,password}:AuthPayloadDto){
        const user = fakeUsers.find((user)=> user.username === username);
        if(!user) {
            throw new HttpException('invalid user', 401);
        }

        if(user.password === password) {
             const {password, ...remaingData} = user;
             return this.jwtService.sign(remaingData);
        }
    }
}

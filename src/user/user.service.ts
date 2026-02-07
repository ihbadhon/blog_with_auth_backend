import { HttpException, Injectable } from '@nestjs/common';
import { ChangePasswordDto } from './dto/change-password.dto';

// Shared fake users database (should match auth service)
const fakeUsers = [
    { 
        id: 1,
        username: 'john',
        password: 'changeme',
        email: 'john@example.com',
        name: 'John Doe'
    },
    { 
        id: 2,
        username: 'maria',
        password: 'guess',
        email: 'maria@example.com',
        name: 'Maria Garcia'
    }
];

@Injectable()
export class UserService {
    
    getUserProfile(userId: number) {
        const user = fakeUsers.find((user) => user.id === userId);
        
        if (!user) {
            throw new HttpException('User not found', 404);
        }
        
        // Return user profile without password
        const { password, ...profile } = user;
        return profile;
    }

    changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
        const user = fakeUsers.find((user) => user.id === userId);
        
        if (!user) {
            throw new HttpException('User not found', 404);
        }

        // Verify current password
        if (user.password !== changePasswordDto.currentPassword) {
            throw new HttpException('Current password is incorrect', 401);
        }

        // Update password
        user.password = changePasswordDto.newPassword;
        
        return {
            message: 'Password changed successfully'
        };
    }
}

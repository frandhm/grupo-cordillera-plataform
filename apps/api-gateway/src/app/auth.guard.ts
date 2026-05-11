import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private jwtService: JwtService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = request.headers.authorization?.split(' ')[1]; // Extrae el token del Header

        if (!token) {
            throw new UnauthorizedException('No proporcionaste una credencial de acceso');
        }

        try {
            // Verificamos si el token es real y no ha expirado
            await this.jwtService.verifyAsync(token, { secret: 'CLAVE_SECRETA_CORDILLERA' });
            return true;
        } catch {
            throw new UnauthorizedException('Tu credencial no es válida o ya expiró');
        }
    }
}
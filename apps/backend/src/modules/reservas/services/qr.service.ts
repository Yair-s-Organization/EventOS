import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as qrcode from 'qrcode';

export interface InfoBoleto {
    idBoleto: number;
    idEvento: number;
    idUsuario: number;
}

@Injectable() 
export class QrService {
    
    constructor(private readonly jwtService : JwtService){}    

    async generateQrCode(info : InfoBoleto, eventEndDate: Date): Promise<{ token: string, qrBase64: string }>{
        //The event end date is converted to seconds
        let expTime = Math.floor((eventEndDate.getTime() - Date.now()) / 1000);
        
        if(expTime <= 0){
            expTime = 1;
        }
        
        //Sign the information 
        const signedToken = await this.jwtService.signAsync(info, {expiresIn: expTime});
        
        //Generate the QR code image in Base64 format
        const base64Image = await qrcode.toDataURL(signedToken);
        
        return {
            token: signedToken,
            qrBase64: base64Image
        };
    }

    async generateImageFromToken(token: string): Promise<string> {
        return await qrcode.toDataURL(token);
    }
}
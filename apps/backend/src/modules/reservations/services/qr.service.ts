import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as qrcode from 'qrcode';

export interface TicketInfo {
    ticketId: number;
    eventId: number;
    userId: number;
}

@Injectable() export class QrService {
    
    constructor(private readonly jwtService : JwtService){}    

    async generateQrCode(info : TicketInfo, eventEndDate: Date): Promise<string>{
        //The event end date is converted to seconds
        const expirationTime = Math.floor(eventEndDate.getTime() / 1000);
        //The exp field is added to the original information
        const newInfo = {
            ...info,
            exp: expirationTime
        };
        //Sign the information
        const signedToken = await this.jwtService.signAsync(newInfo);
        //Generate the QR code image in Base64 format
        const base64Image = await qrcode.toDataURL(signedToken);
        return base64Image;
    }

}
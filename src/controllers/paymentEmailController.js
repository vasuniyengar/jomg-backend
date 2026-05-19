import prisma from "../config/prisma.js"
import sendEmail from "../utils/sendEmail.js"

const sendUnpaidEmails = async () =>{
    try{
        const unpaidPlayers = await prisma.player.findMany({
            where:{
                AND: [
                    {isValid:1},
                    {
                        NOT: {
                            paid:{
                                contains: "Paid",
                            },
                        },
                    },
                    {
                        NOT: {
                            paid: {
                                contains :"Comp",
                            },
                        },
                    },
                ],
            },
            select:{id: true, name: true, email: true, paid: true}
        });
        if (unpaidPlayers.length == 0){
            return {
                error: false,
                code:200,
                message: "all players have paid",
                data:[],
            };
        }
        const results = {sent:[], failed: []};
        for(const player of unpaidPlayers){
            try{
                await sendEmail({
                    to: player.email,
                    subject: "Pickleball Payment Reminder",
                    html: `<p>This is a test payment email.</p>`,
                    text: "This is a test payment email.",
                });
                results.sent.push({name:player.name, email: player.email});

            }catch (err){
                results.failed.push({name:player.name, email: player.email, reason: err.message});
            }
        }
        return {
            success: true,
            message: 'Emails sent',
            data: results,
        };
        

       
    }
    catch(error){
        return {
            error: true,
            code: 500,
            message: error.message,
        };
    }
};
export { sendUnpaidEmails }
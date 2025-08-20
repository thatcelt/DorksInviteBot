import { AminoDorksAPIError } from "amino.dorks";
import { User } from 'amino.dorks/dist/schemas/aminoapps/user';
import { AMINODORKS, COLORIZE, MAX_USERS_PER_INVITE, RL_INTERFACE, STRINGS, STRUCTURIZE } from "./constants";

console.clear();
console.log(COLORIZE(
    `${Buffer.from(STRINGS.base64ASCIILogo, 'base64').toString()}\n${STRINGS.credits}\n`
));

(async () => {
    await AMINODORKS.security.login(
        await RL_INTERFACE.question(COLORIZE(STRINGS.loginPrompt)),
        await RL_INTERFACE.question(COLORIZE(STRINGS.passwordPrompt))
    );
    
    const resolution = await AMINODORKS.getLinkResolution(
        await RL_INTERFACE.question(COLORIZE(STRINGS.invitePrompt))
    );

    const ndc = AMINODORKS.as(resolution.ndcId);
    const staff = [
        ...(await ndc.user.getMany({ start: 0, size: 25 }, 'curators')).map((user) => user.uid),
        ...(await ndc.user.getMany({ start: 0, size: 25 }, 'leaders')).map((user) => user.uid)
    ];
    const maxUsers = Number(await RL_INTERFACE.question(COLORIZE(STRINGS.maxUsersPrompt)));

    let startRecentUsers = 0;

    for (let startUser = 0; startUser < maxUsers; startUser += MAX_USERS_PER_INVITE) {
        let users: User[] = [];

        if (!startRecentUsers) users = await ndc.user.getInOnline({ start: startUser, size: MAX_USERS_PER_INVITE });
        
        if (users.length < MAX_USERS_PER_INVITE) {
            users = await ndc.user.getMany({ start: startRecentUsers, size: MAX_USERS_PER_INVITE });
            startRecentUsers += MAX_USERS_PER_INVITE;
        };

        users.splice(MAX_USERS_PER_INVITE, users.length - MAX_USERS_PER_INVITE);
        if (users.length < MAX_USERS_PER_INVITE) break;

        users = users.filter((user) => !staff.includes(user.uid));

        try {
            await ndc.thread.invite(resolution.objectId, users.map((user) => user.uid));
        } catch (error) {
            if (error instanceof AminoDorksAPIError && error.code == 1611) {
                console.log(STRUCTURIZE(COLORIZE(STRINGS.chatInvitesDisabled), [resolution.objectId]));
            }
            continue;
        }
        finally {
            console.log(STRUCTURIZE(`${COLORIZE(STRINGS.invitesSuccess)} ${users.length}`, [resolution.objectId]));
        };
    };
    console.log(COLORIZE(`\n${STRINGS.inviteFinished}`));
    process.exit(0);
})();

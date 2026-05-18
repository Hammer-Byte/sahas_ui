import { TEXT_NORMAL, TEXT_SMALL } from "../style";

export default function NotFound() {
    return (
        <div className="flex flex-column align-items-center justify-content-center min-h-screen p-2 text-center">
            <img src="images/404-error.png" alt="forbidden" className="w-6rem lg:w-8rem" />
            <p className={`${TEXT_NORMAL} font-bold`}>You don't have access to this page.</p>
            <p className={`${TEXT_SMALL} text-color-secondary`}>Please contact your administrator if you need permission to continue.</p>
        </div>
    );
}

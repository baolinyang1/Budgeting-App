import React, { useState } from "react";
import { Box } from "./ui/box";
import { Menu, MenuItem, MenuItemLabel } from "./ui/menu";
import { Button, ButtonIcon } from "./ui/button";
import { PlusCircleIcon } from "lucide-react-native";
import AddingChallengePopup from "./popups/AddingChallengePopup";
import PremadeChallengePopup from "./popups/PremadeChallengePopup";

type ChallengeCreationMenuProps = {
    getChallenges: () => Promise<void>;
}

const ChallengeCreationMenu: React.FC<ChallengeCreationMenuProps> = ({getChallenges}) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [selected, setSelected] = useState<Set<string>>(new Set());

    const [customOpen, setCustomOpen] = useState<boolean>(false);
    const [premadeOpen, setPremadeOpen] = useState<boolean>(false);

    const handleClose = () => {
        console.log(selected);
        setSelected(new Set([]));
        setIsOpen(false);
    }

    return (
        <Box style={{ flex: 1, position: 'relative', width: "100%", height: "100%"}}>
            <Menu
                isOpen={isOpen}
                onOpen={() => setIsOpen(true)}
                onClose= {handleClose}
                placement="bottom right"
                offset={5}
                trigger={({ ...triggerProps }) => {
                    return (
                    <Button {...triggerProps} 
                        style={{
                            position: 'absolute',
                            bottom: 10,
                            right: 10,
                            zIndex: 1000,
                            height: 50
                        }}
                    >
                        <ButtonIcon as={PlusCircleIcon} />
                    </Button>
                    )
                }}
                selectedKeys={selected}
                selectionMode="single"
                onSelectionChange={(keys) => {
                    // console.log(keys);
                    const selectedKey = [...keys][0] as string;
                    setSelected(keys as Set<string>);
                    if (selectedKey === "premade") {
                        console.log("premade");
                        setPremadeOpen(true);
                    }
                    else if (selectedKey === "custom") {
                        console.log("custom");
                        setCustomOpen(true);
                    }
                }}
            >
                <MenuItem key="premade" textValue="Pre-made Challenge" style={{height: 50, width: 50}}>
                    <MenuItemLabel>Pre-made Challenge</MenuItemLabel>
                </MenuItem>
                <MenuItem key="custom" textValue="Custom Challenge" style={{height: 50, width: 50}}>
                    <MenuItemLabel>Custom Challenge</MenuItemLabel>
                </MenuItem>
            </Menu>
            <AddingChallengePopup refreshChallenges={getChallenges} isOpen={customOpen} setIsOpen={setCustomOpen} />
            <PremadeChallengePopup refreshChallenges={getChallenges} isOpen={premadeOpen} setIsOpen={setPremadeOpen} />
        </Box>
    )
}

export default ChallengeCreationMenu;
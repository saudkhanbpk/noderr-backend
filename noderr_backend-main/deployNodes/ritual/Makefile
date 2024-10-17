# phony targets are targets that don't actually create a file
.phony: deploy

# anvil's third default address
sender := 0x2759b2406887225a9b2f7c17d9aaef7937aeb7f59f72e87a5759a16b7a0e92e3
RPC_URL := https://base-rpc.publicnode.com/

# deploying the contract
deploy:
	@PRIVATE_KEY=$(sender) forge script script/Deploy.s.sol:Deploy --broadcast --rpc-url $(RPC_URL)

# calling sayGM()
call-contract:
	@PRIVATE_KEY=$(sender) forge script script/CallContract.s.sol:CallContract --broadcast --rpc-url $(RPC_URL)
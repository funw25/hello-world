//输出大于等于2015的10个素数
#include <stdio.h>
int main(void){
	int i,j,flag,n;
	n=0;
	i=2015;
	while(n<10){
		flag=0;  
		for(j=2;j<i;j++)
			if(i%j==0){
				flag=1;
				break;
			}
		if(flag==0){
			n=n+1;
			printf("%d\n",i);
		} 
		i=i+2;
	}
	return 0;
}


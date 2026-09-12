#include<stdio.h>
int main()
{
    int t,c;
    float s;
    scanf("%f %d",&s,&t);
    if(s<=3){
        c=10+t/5*2;
    }
    else if(s>3&&s<=10){
        c=10+(s-3)*2+t/5*2;
    }
    else if(s>10){
        c=24+t/5*2+(s-10)*3;
    }
    printf("%d",c);
    return 0;
}
